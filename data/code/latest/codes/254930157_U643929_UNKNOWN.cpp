#include <bits/stdc++.h>
using namespace std;

using i64 = long long;
using i128 = __int128_t;

static inline bool is_sep(char c) {
    return c==' ' || c==',' || c=='\t' || c=='\r' || c=='\n';
}

// ---------------- Fast line reader ----------------
struct FastIn {
    static const int SZ = 1 << 20;
    int idx = 0, size = 0;
    char buf[SZ];

    inline char gc() {
        if (idx >= size) {
            size = (int)fread(buf, 1, SZ, stdin);
            idx = 0;
            if (!size) return 0;
        }
        return buf[idx++];
    }

    bool getline_str(string &s) {
        s.clear();
        char c = gc();
        if (!c) return false;
        while (c == '\r') c = gc();
        while (c && c != '\n') {
            s.push_back(c);
            c = gc();
        }
        if (!s.empty() && s.back()=='\r') s.pop_back();
        return true;
    }
} IN;

// split into up to 12 tokens (positions)
static inline int split12(const string &line, array<pair<int,int>,12> &pos) {
    int n = (int)line.size();
    int i = 0, cnt = 0;
    while (i < n && is_sep(line[i])) i++;
    while (i < n && cnt < 12) {
        int l = i;
        while (i < n && !is_sep(line[i])) i++;
        int r = i;
        pos[cnt++] = {l, r};
        while (i < n && is_sep(line[i])) i++;
    }
    return cnt;
}

// parse decimal [l,r) to cents; support NA
static inline i64 parse_cents(const string &s, int l, int r, bool &ok) {
    ok = true;
    if (l >= r) { ok=false; return 0; }
    if (r-l==2 && (tolower((unsigned char)s[l])=='n') && (tolower((unsigned char)s[l+1])=='a')) {
        ok=false; return 0;
    }
    i64 ip=0, fp=0; int fl=0; bool dot=false;
    for (int i=l;i<r;i++) {
        char c=s[i];
        if (c=='.') { dot=true; continue; }
        if (c<'0' || c>'9') { ok=false; return 0; }
        int d=c-'0';
        if (!dot) ip=ip*10+d;
        else if (fl<2) { fp=fp*10+d; fl++; }
    }
    if (!dot) { fp=0; fl=0; }
    if (fl==0) fp*=100;
    else if (fl==1) fp*=10;
    return ip*100 + fp;
}

struct Order { bool buy; int idx; int qty; };

// ---------------- Strategy state per stock ----------------
struct StockState {
    bool ema_init=false;
    double ema20=0.0, ema60=0.0;
    deque<i64> close_q;   // keep 61 closes
    double mom60=-1e100;
    i64 last_close=0;
    bool have_last=false;
};

struct Trader {
    // params from INIT
    int n=200, D=0, L=100, Kmax=0;
    double alpha=0.0, com_min=0.0, beta=0.0;
    i64 cash=0; // cents

    vector<string> codes;
    unordered_map<string,int> mp;

    // holdings
    vector<i64> pos; // shares

    // today market (cents)
    vector<i64> op, hi, lo, cl, amt;

    // indicators
    vector<StockState> st;

    // pending orders (submitted yesterday, executed today open)
    vector<Order> pending;

    int day = 0; // day index we have just received (day0=0)

    // ---- fees in cents ----
    i64 commission(i64 value_cents) const {
        long double v = (long double)value_cents / 100.0L;
        long double c = (long double)alpha * v;
        long double mn = (long double)com_min;
        long double use = (c < mn ? mn : c);
        return (i64) llround(use * 100.0L);
    }
    i64 stamp(i64 value_cents) const {
        long double v = (long double)value_cents / 100.0L;
        long double t = (long double)beta * v;
        return (i64) llround(t * 100.0L);
    }

    // Try parse a line as a market row. Return true if it's one of our 200 codes.
    bool parse_market_line(const string &line, int &out_i) {
        array<pair<int,int>,12> p;
        int cnt = split12(line, p);
        if (cnt < 8) return false;
        string code(line.begin()+p[1].first, line.begin()+p[1].second);
        auto it = mp.find(code);
        if (it == mp.end()) return false;

        int i = it->second;
        bool ok;
        op[i]  = parse_cents(line, p[2].first, p[2].second, ok); if(!ok) op[i]=0;
        hi[i]  = parse_cents(line, p[3].first, p[3].second, ok); if(!ok) hi[i]=0;
        lo[i]  = parse_cents(line, p[4].first, p[4].second, ok); if(!ok) lo[i]=0;
        cl[i]  = parse_cents(line, p[5].first, p[5].second, ok); if(!ok) cl[i]=0;
        amt[i] = parse_cents(line, p[7].first, p[7].second, ok); if(!ok) amt[i]=0;

        out_i = i;
        return true;
    }

    // Robustly read until we collect exactly n valid market rows.
    // Return: 0 ok, 1 FINISH, -1 EOF/ERROR/INVALID
    int read_one_day_market() {
        string line;
        int got = 0;

        fill(op.begin(), op.end(), 0);
        fill(hi.begin(), hi.end(), 0);
        fill(lo.begin(), lo.end(), 0);
        fill(cl.begin(), cl.end(), 0);
        fill(amt.begin(), amt.end(), 0);

        vector<char> seen(n, 0);

        while (got < n) {
            if (!IN.getline_str(line)) return -1;

            if (line.rfind("FINISH", 0) == 0) return 1;
            if (line.rfind("INVALID", 0) == 0 || line.rfind("ERROR", 0) == 0) return -1;

            int idx;
            if (!parse_market_line(line, idx)) {
                // not a market row -> treat as judge log, skip
                continue;
            }
            if (!seen[idx]) {
                seen[idx] = 1;
                got++;
            }
        }
        return 0;
    }

    // Execute pending at today's open price
    void apply_pending_open() {
        for (auto &od : pending) {
            int i = od.idx, q = od.qty;
            i64 p = op[i];
            if (p <= 0) continue; // halted
            i64 value = p * (i64)q;
            i64 com = commission(value);

            if (od.buy) {
                // note: judge also rejects buy on limit-up; we just submit and let judge reject if needed
                i64 cost = value + com;
                if (cash >= cost) {
                    cash -= cost;
                    pos[i] += q;
                }
            } else {
                if (pos[i] >= q) {
                    i64 tax = stamp(value);
                    i64 gain = value - tax - com;
                    cash += gain;
                    pos[i] -= q;
                }
            }
        }
        pending.clear();
    }

    // Update indicators with today's close (O(1))
    void update_indicators() {
        for (int i=0;i<n;i++) {
            auto &s = st[i];
            i64 C = cl[i];
            if (C <= 0) continue;

            // EMA
            double a20 = 2.0 / (20.0 + 1.0);
            double a60 = 2.0 / (60.0 + 1.0);
            if (!s.ema_init) {
                s.ema20 = (double)C;
                s.ema60 = (double)C;
                s.ema_init = true;
            } else {
                s.ema20 = a20*(double)C + (1.0-a20)*s.ema20;
                s.ema60 = a60*(double)C + (1.0-a60)*s.ema60;
            }

            // Momentum 60
            s.close_q.push_back(C);
            if ((int)s.close_q.size() > 61) s.close_q.pop_front();
            if ((int)s.close_q.size() == 61) {
                i64 old = s.close_q.front();
                if (old > 0) s.mom60 = log((double)C / (double)old);
            }

            s.last_close = C;
            s.have_last = true;
        }
    }

    i64 portfolio_value_close() const {
        i64 v = cash;
        for(int i=0;i<n;i++){
            if(pos[i]>0 && cl[i]>0) v += pos[i]*cl[i];
        }
        return v;
    }

    // Build orders based on the latest received day (day=0..D)
    vector<Order> build_orders() {
        vector<Order> out;

        // If last day already received and judge will execute at close, safest is do nothing.
        if (day >= D) return out;

        // Warm-up: no trading first ~30 days to stabilize EMA & MOM
        if (day < 30) return out;

        // Exit rule: if holding and close < EMA20 => sell all
        for (int i=0;i<n;i++){
            if(pos[i] <= 0) continue;
            if(cl[i] <= 0) continue;
            if(st[i].ema_init && (double)cl[i] < st[i].ema20) {
                int qty = (int)(pos[i] / L) * L;
                if(qty>0) out.push_back({false, i, qty});
            }
        }

        // Rebalance every 5 days to reduce fees
        if (day % 5 != 0) {
            if ((int)out.size() > Kmax) out.resize(Kmax);
            return out;
        }

        // Pick top-3 by mom60 among EMA20>EMA60 trend
        struct Cand { int i; double sc; };
        vector<Cand> cands;
        cands.reserve(n);
        for(int i=0;i<n;i++){
            if(cl[i] <= 0) continue;
            if(!st[i].ema_init) continue;
            if((int)st[i].close_q.size() < 61) continue;
            if(!(st[i].ema20 > st[i].ema60)) continue;
            cands.push_back({i, st[i].mom60});
        }
        sort(cands.begin(), cands.end(), [](const Cand&a,const Cand&b){ return a.sc>b.sc; });
        if((int)cands.size() > 3) cands.resize(3);

        vector<char> want(n, 0);
        for(auto &c: cands) want[c.i] = 1;

        // Target: equal weight on wanted stocks; keep 5% cash buffer
        i64 pv = portfolio_value_close();
        i64 invest = (i64) llround((long double)pv * 0.95L);
        int k = (int)cands.size();
        if(k == 0) {
            if ((int)out.size() > Kmax) out.resize(Kmax);
            return out;
        }
        i64 per = invest / k;

        vector<i64> target(n, 0);
        for(auto &c: cands){
            int i = c.i;
            if(cl[i] <= 0) continue;
            i64 sh = per / cl[i];
            sh = (sh / L) * L;
            // avoid tiny trades (com_min kills)
            if(sh > 0 && sh * cl[i] < 5000LL * 100LL) sh = 0;
            target[i] = sh;
        }

        // translate to diff orders: sell then buy (simulate cash by close as conservative)
        vector<Order> sells, buys;
        for(int i=0;i<n;i++){
            i64 cur = pos[i], tar = target[i];
            if(cur > tar){
                i64 d = (cur - tar) / L * L;
                if(d>0) sells.push_back({false,i,(int)d});
            }
        }
        for(int i=0;i<n;i++){
            i64 cur = pos[i], tar = target[i];
            if(tar > cur){
                i64 d = (tar - cur) / L * L;
                if(d>0) buys.push_back({true,i,(int)d});
            }
        }

        // Merge: exit-sells already in out; add rebalance sells then buys with cash check
        // local sim cash
        i64 sim_cash = cash;
        vector<i64> sim_pos = pos;

        auto try_add = [&](const Order &od){
            if((int)out.size() >= Kmax) return;
            int i = od.idx, q = od.qty;
            i64 p = cl[i];
            if(p <= 0) return;
            i64 value = p * (i64)q;
            i64 com = commission(value);
            if(od.buy){
                i64 cost = value + com;
                // small buffer
                i64 buf = (i64) llround((long double)cost * 1.01L);
                if(sim_cash >= buf){
                    sim_cash -= cost;
                    sim_pos[i] += q;
                    out.push_back(od);
                }
            }else{
                if(sim_pos[i] >= q){
                    i64 tax = stamp(value);
                    i64 gain = value - tax - com;
                    sim_cash += gain;
                    sim_pos[i] -= q;
                    out.push_back(od);
                }
            }
        };

        // First apply current out sells to sim (approx by close)
        for (auto &od: out) {
            // only sells present here
            int i=od.idx, q=od.qty;
            i64 p=cl[i];
            if(p<=0) continue;
            if(sim_pos[i] < q) continue;
            i64 value=p*(i64)q;
            i64 com=commission(value);
            i64 tax=stamp(value);
            sim_cash += value - tax - com;
            sim_pos[i] -= q;
        }

        for(auto &od: sells) try_add(od);
        for(auto &od: buys)  try_add(od);

        if ((int)out.size() > Kmax) out.resize(Kmax);
        return out;
    }
};

int main() {
    // Read INIT line
    string line;
    if(!IN.getline_str(line)) return 0;

    Trader tr;
    {
        // INIT n D m L alpha com_min beta K_max
        char tag[16];
        long long m_yuan=0;
        if(sscanf(line.c_str(), "%s %d %d %lld %d %lf %lf %lf %d",
                  tag, &tr.n, &tr.D, &m_yuan, &tr.L, &tr.alpha, &tr.com_min, &tr.beta, &tr.Kmax) != 9) {
            return 0;
        }
        tr.cash = m_yuan * 100LL;

        tr.codes.assign(tr.n, "");
        tr.mp.reserve(tr.n * 2);

        tr.pos.assign(tr.n, 0);

        tr.op.assign(tr.n, 0);
        tr.hi.assign(tr.n, 0);
        tr.lo.assign(tr.n, 0);
        tr.cl.assign(tr.n, 0);
        tr.amt.assign(tr.n, 0);

        tr.st.assign(tr.n, StockState());
    }

    // Read day0 n lines; mapping depends on init list order
    for(int i=0;i<tr.n;i++){
        if(!IN.getline_str(line)) return 0;
        array<pair<int,int>,12> p;
        int cnt = split12(line, p);
        if(cnt < 8) return 0;

        string code(line.begin()+p[1].first, line.begin()+p[1].second);
        tr.codes[i] = code;
        tr.mp[code] = i;

        // parse day0 row directly
        int dummy;
        tr.parse_market_line(line, dummy);
    }

    tr.day = 0;
    // day0 indicators
    tr.update_indicators();

    while(true){
        // Decide orders based on last received day (day0 first)
        vector<Order> orders = tr.build_orders();
        if((int)orders.size() > tr.Kmax) orders.resize(tr.Kmax);

        // Output orders
        for(auto &od: orders){
            if(od.buy) printf("BUY %s %d\n", tr.codes[od.idx].c_str(), od.qty);
            else       printf("SELL %s %d\n", tr.codes[od.idx].c_str(), od.qty);
        }
        puts("DONE");
        fflush(stdout);

        tr.pending = orders;

        // Read next day's market robustly
        int rc = tr.read_one_day_market();
        if(rc == 1) return 0;   // FINISH
        if(rc == -1) return 0;  // EOF/ERROR

        // We have received day t market, execute pending at open
        tr.day += 1;
        tr.apply_pending_open();

        // Update indicators with today's close
        tr.update_indicators();

        // Loop continues until FINISH line appears (caught in read_one_day_market)
    }
    return 0;
}
