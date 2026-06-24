#include <bits/stdc++.h>
using namespace std;

using i64  = long long;
using i128 = __int128_t;

static inline bool is_sep(char c){
    return c==' '||c==','||c=='\t'||c=='\r'||c=='\n';
}

// -------- Fast line reader (fread) --------
struct FastIn {
    static const int SZ = 1 << 20;
    int i = 0, n = 0;
    char b[SZ];

    inline char gc() {
        if (i >= n) {
            n = (int)fread(b, 1, SZ, stdin);
            i = 0;
            if (!n) return 0;
        }
        return b[i++];
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
        if (!s.empty() && s.back() == '\r') s.pop_back();
        return true;
    }
} IN;

// split line into up to 12 tokens by comma/space
static inline int split12(const string &line, array<pair<int,int>,12> &pos){
    int cnt = 0, n = (int)line.size(), i = 0;
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
static inline i64 parse_cents(const string &s, int l, int r, bool &ok){
    ok = true;
    if (l >= r) { ok = false; return 0; }
    if (r-l==2 && (tolower((unsigned char)s[l])=='n') && (tolower((unsigned char)s[l+1])=='a')) {
        ok = false; return 0;
    }
    i64 ip = 0, fp = 0;
    int fl = 0; bool dot = false;
    for (int i=l;i<r;i++){
        char c = s[i];
        if (c=='.'){ dot = true; continue; }
        if (c<'0'||c>'9'){ ok=false; return 0; }
        int d=c-'0';
        if(!dot) ip = ip*10 + d;
        else if(fl<2){ fp = fp*10 + d; fl++; }
    }
    if(!dot){ fp=0; fl=0; }
    if(fl==0) fp*=100;
    else if(fl==1) fp*=10;
    return ip*100 + fp;
}

// -------- Strategy / State --------
struct Order { bool buy; int idx; int qty; };

struct StockState {
    // EMA
    bool ema_init=false;
    double ema20=0.0, ema60=0.0;

    // last close
    i64 last_close=0;
    bool have_last=false;

    // ATR14 (rolling)
    static const int ATRN = 14;
    double tr[ATRN]{};
    int tr_pos=0, tr_cnt=0;
    double tr_sum=0.0;
    double atr=0.0;

    // VOL20 (rolling log-return std)
    static const int VOLN = 20;
    double lr[VOLN]{};
    int lr_pos=0, lr_cnt=0;
    double lr_sum=0.0, lr_sumsq=0.0;
    double vol=0.0;

    // MOM60 (keep 61 closes)
    static const int MOMN = 61;
    i64 close_hist[MOMN]{};
    int ch_pos=0, ch_cnt=0;
    double mom=-1e100;

    // LIQ20 (avg amount)
    static const int LIQN = 20;
    i64 amt_hist[LIQN]{};
    int ah_pos=0, ah_cnt=0;
    i128 amt_sum=0;

    // Max55 monotonic queue (store last 55 closes, max at head)
    static const int MXN = 64;
    int mx_day[MXN];
    i64 mx_close[MXN];
    int mx_head=0, mx_tail=0; // [head, tail)
    i64 prev_max55=0;         // max of previous 55 days (excluding today), updated each day

    // trailing peak
    i64 peak_close=0;
};

struct Trader {
    int n=200, D=0, L=100, Kmax=0;
    double alpha=0.0, com_min=0.0, beta=0.0;

    i64 cash=0;                 // cents
    vector<i64> pos;            // shares
    vector<i64> cost;           // rough cost cents

    vector<string> codes;
    unordered_map<string,int> mp;

    // today market
    vector<i64> op, hi, lo, cl, amt;

    vector<StockState> st;

    // pending orders submitted last round, execute on today's open
    vector<Order> pending;

    int day=0; // last received day index (0..D)

    // params (可调)
    int LB_BREAK = 55;
    int rebalance_period = 5;
    int maxHold = 4;

    long long liq_min_yuan = 5000000; // avg amount 20d >= 500万
    long long min_trade_yuan = 5000;  // min notional to avoid com_min dominating

    double atr_stop_k = 3.0;
    double mom_w = 2.2;
    double vol_w = 1.4;

    // ---------- fees (cents) ----------
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

    // ---------- apply pending at today's open ----------
    void apply_pending_open(){
        for(const auto &od: pending){
            int i=od.idx, q=od.qty;
            i64 p=op[i];
            if(p<=0) continue; // halted -> dropped
            i64 value = p*(i64)q;
            i64 com = commission(value);

            if(od.buy){
                i64 costv = value + com;
                if(cash >= costv){
                    cash -= costv;
                    cost[i] += costv;
                    pos[i]  += q;
                }
            }else{
                if(pos[i] >= q){
                    i64 tax = stamp(value);
                    i64 gain = value - tax - com;
                    cash += gain;

                    // rough reduce cost proportionally
                    i64 old = pos[i];
                    if(old>0 && cost[i]>0){
                        i64 red = (i64) llround((long double)cost[i] * (long double)q / (long double)old);
                        cost[i] -= red; if(cost[i] < 0) cost[i]=0;
                    }
                    pos[i] -= q;
                    if(pos[i]==0){
                        cost[i]=0;
                        st[i].peak_close=0;
                    }
                }
            }
        }
        pending.clear();
    }

    // ---------- O(1) indicator update per stock ----------
    void update_one(int i){
        auto &s = st[i];
        i64 C = cl[i], H = hi[i], Lw = lo[i], A = amt[i];

        // 1) prev_max55 (exclude today): pop outdated first, then take head, THEN push today
        // pop outdated (<= day - LB_BREAK)
        while(s.mx_head != s.mx_tail){
            int d = s.mx_day[s.mx_head];
            if(d <= day - LB_BREAK){
                s.mx_head = (s.mx_head + 1) % StockState::MXN;
            }else break;
        }
        s.prev_max55 = (s.mx_head != s.mx_tail) ? s.mx_close[s.mx_head] : 0;

        // 2) EMA20/EMA60
        if(C>0){
            double a20 = 2.0/(20.0+1.0);
            double a60 = 2.0/(60.0+1.0);
            if(!s.ema_init){
                s.ema20 = (double)C;
                s.ema60 = (double)C;
                s.ema_init = true;
            }else{
                s.ema20 = a20*(double)C + (1.0-a20)*s.ema20;
                s.ema60 = a60*(double)C + (1.0-a60)*s.ema60;
            }
        }

        // 3) ATR14 needs prev close
        if(s.have_last && s.last_close>0 && H>0 && Lw>0){
            double pc = (double)s.last_close;
            double tr = max((double)(H-Lw), max(fabs((double)H-pc), fabs((double)Lw-pc)));

            if(s.tr_cnt < StockState::ATRN){
                s.tr[s.tr_pos] = tr;
                s.tr_sum += tr;
                s.tr_pos = (s.tr_pos+1) % StockState::ATRN;
                s.tr_cnt++;
            }else{
                s.tr_sum -= s.tr[s.tr_pos];
                s.tr[s.tr_pos] = tr;
                s.tr_sum += tr;
                s.tr_pos = (s.tr_pos+1) % StockState::ATRN;
            }
            if(s.tr_cnt == StockState::ATRN) s.atr = s.tr_sum / (double)StockState::ATRN;
        }

        // 4) VOL20 + MOM60 needs prev close
        if(s.have_last && s.last_close>0 && C>0){
            double lr = log((double)C / (double)s.last_close);

            // rolling vol
            if(s.lr_cnt < StockState::VOLN){
                s.lr[s.lr_pos] = lr;
                s.lr_sum += lr;
                s.lr_sumsq += lr*lr;
                s.lr_pos = (s.lr_pos+1) % StockState::VOLN;
                s.lr_cnt++;
            }else{
                double old = s.lr[s.lr_pos];
                s.lr_sum -= old;
                s.lr_sumsq -= old*old;
                s.lr[s.lr_pos] = lr;
                s.lr_sum += lr;
                s.lr_sumsq += lr*lr;
                s.lr_pos = (s.lr_pos+1) % StockState::VOLN;
            }
            if(s.lr_cnt == StockState::VOLN){
                double m = s.lr_sum / (double)StockState::VOLN;
                double v = s.lr_sumsq / (double)StockState::VOLN - m*m;
                if(v < 0) v = 0;
                s.vol = sqrt(v);
            }
        }

        // 5) MOM60 store closes
        if(C>0){
            if(s.ch_cnt < StockState::MOMN){
                s.close_hist[s.ch_pos] = C;
                s.ch_pos = (s.ch_pos+1) % StockState::MOMN;
                s.ch_cnt++;
            }else{
                // overwrite oldest (circular)
                s.close_hist[s.ch_pos] = C;
                s.ch_pos = (s.ch_pos+1) % StockState::MOMN;
            }
            if(s.ch_cnt == StockState::MOMN){
                // oldest is at ch_pos (next write position) after full
                int oldest_idx = s.ch_pos;
                i64 old = s.close_hist[oldest_idx];
                if(old>0) s.mom = log((double)C / (double)old);
            }
        }

        // 6) LIQ20 avg amount
        if(A>0){
            if(s.ah_cnt < StockState::LIQN){
                s.amt_hist[s.ah_pos] = A;
                s.amt_sum += (i128)A;
                s.ah_pos = (s.ah_pos+1) % StockState::LIQN;
                s.ah_cnt++;
            }else{
                s.amt_sum -= (i128)s.amt_hist[s.ah_pos];
                s.amt_hist[s.ah_pos] = A;
                s.amt_sum += (i128)A;
                s.ah_pos = (s.ah_pos+1) % StockState::LIQN;
            }
        }

        // 7) push today close into max55 monotonic queue (decreasing)
        if(C>0){
            while(s.mx_head != s.mx_tail){
                int prev = (s.mx_tail - 1 + StockState::MXN) % StockState::MXN;
                if(s.mx_close[prev] <= C){
                    s.mx_tail = prev;
                }else break;
            }
            s.mx_day[s.mx_tail] = day;
            s.mx_close[s.mx_tail] = C;
            s.mx_tail = (s.mx_tail + 1) % StockState::MXN;
            // if full (should not happen with MXN=64 and window=55), advance head
            if(s.mx_tail == s.mx_head){
                s.mx_head = (s.mx_head + 1) % StockState::MXN;
            }
        }

        // 8) update last_close + peak
        if(C>0){
            s.last_close = C;
            s.have_last = true;
            if(pos[i]>0) s.peak_close = max(s.peak_close, C);
        }
    }

    i64 portfolio_value_close() const {
        i64 v = cash;
        for(int i=0;i<n;i++){
            if(pos[i]>0 && cl[i]>0) v += pos[i]*cl[i];
        }
        return v;
    }

    // candidate score (no loops)
    bool score_stock(int i, double &sc){
        auto &s = st[i];
        if(cl[i]<=0) return false;
        if(!s.ema_init) return false;
        if(s.ch_cnt < StockState::MOMN) return false;
        if(s.lr_cnt < StockState::VOLN) return false;
        if(s.ah_cnt < StockState::LIQN) return false;
        if(day < LB_BREAK) return false;

        // liquidity filter
        long long avg_amt_cents = (long long)(s.amt_sum / (i128)StockState::LIQN);
        if(avg_amt_cents < (long long)liq_min_yuan*100LL) return false;

        // trend filter
        if(!(s.ema20 > s.ema60)) return false;

        bool breakout = (s.prev_max55>0 && cl[i] >= s.prev_max55);

        sc = mom_w * s.mom - vol_w * s.vol + (breakout ? 0.6 : 0.0);
        return true;
    }

    vector<Order> build_orders(){
        vector<Order> out;
        if(day > D) return out;

        // day==D：收到最后一天行情后，仍可下最后一次单（按 close 执行），这里默认不动
        if(day == D) return out;

        // 1) exits (always)
        vector<Order> sells;
        sells.reserve(n);
        for(int i=0;i<n;i++){
            if(pos[i]<=0 || cl[i]<=0) continue;
            auto &s = st[i];
            bool exit=false;

            if(s.atr>0.0){
                double thr = (double)s.peak_close - atr_stop_k * s.atr;
                if((double)cl[i] < thr) exit=true;
            }
            if(s.ema_init && (double)cl[i] < s.ema20) exit=true;

            if(exit){
                int qty = (int)(pos[i]/L)*L;
                if(qty>0) sells.push_back({false,i,qty});
            }
        }

        bool do_reb = (day % rebalance_period == 0);

        if(!do_reb){
            for(auto &od: sells){
                out.push_back(od);
                if((int)out.size()>=Kmax) break;
            }
            return out;
        }

        // 2) pick top momentum candidates
        struct Cand{ int i; double sc; };
        vector<Cand> cands; cands.reserve(n);
        for(int i=0;i<n;i++){
            double sc;
            if(score_stock(i, sc)) cands.push_back({i, sc});
        }
        sort(cands.begin(), cands.end(), [](const Cand&a,const Cand&b){ return a.sc>b.sc; });
        if((int)cands.size() > maxHold) cands.resize(maxHold);

        // 3) target equal weight (95% invest, keep cash buffer)
        i64 pv = portfolio_value_close();
        i64 invest = (i64) llround((long double)pv * 0.95L);
        int k = (int)cands.size();
        vector<i64> target(n,0);

        if(k>0){
            i64 per = invest / k;
            for(auto &c: cands){
                int i=c.i;
                if(cl[i]<=0) continue;
                i64 sh = per / cl[i];
                sh = (sh / L) * L;
                if(sh>0 && sh*cl[i] < (i64)min_trade_yuan*100LL) sh = 0;
                target[i] = sh;
            }
        }

        // exits override
        for(auto &od: sells) target[od.idx]=0;

        // 4) translate to sell then buy, with local cash sim (use close as estimate)
        vector<Order> diff_s, diff_b;
        diff_s.reserve(n); diff_b.reserve(n);
        for(int i=0;i<n;i++){
            i64 cur=pos[i], tar=target[i];
            if(cur>tar){
                i64 d = (cur-tar)/L*L;
                if(d>0) diff_s.push_back({false,i,(int)d});
            }
        }
        for(int i=0;i<n;i++){
            i64 cur=pos[i], tar=target[i];
            if(tar>cur){
                i64 d = (tar-cur)/L*L;
                if(d>0) diff_b.push_back({true,i,(int)d});
            }
        }

        i64 sim_cash=cash;
        vector<i64> sim_pos=pos;

        auto try_add = [&](const Order &od){
            if((int)out.size()>=Kmax) return;
            int i=od.idx, q=od.qty;
            i64 p=cl[i];
            if(p<=0) return;
            i64 value=p*(i64)q;
            i64 com=commission(value);

            if(od.buy){
                i64 costv=value+com;
                i64 buf=(i64) llround((long double)costv*1.01L);
                if(sim_cash>=buf){
                    sim_cash-=costv;
                    sim_pos[i]+=q;
                    out.push_back(od);
                }
            }else{
                if(sim_pos[i]>=q){
                    i64 tax=stamp(value);
                    i64 gain=value-tax-com;
                    sim_cash+=gain;
                    sim_pos[i]-=q;
                    out.push_back(od);
                }
            }
        };

        for(auto &od: diff_s) try_add(od);
        for(auto &od: diff_b) try_add(od);

        return out;
    }
};

// -------- Robust read of one full day market (skip logs) --------
// return: 0=got one day; 1=FINISH; -1=EOF/ERROR
int read_one_day_market(
    Trader &tr
){
    string line;
    vector<char> vis(tr.n, 0);
    int got = 0;

    // reset today arrays
    fill(tr.op.begin(), tr.op.end(), 0);
    fill(tr.hi.begin(), tr.hi.end(), 0);
    fill(tr.lo.begin(), tr.lo.end(), 0);
    fill(tr.cl.begin(), tr.cl.end(), 0);
    fill(tr.amt.begin(), tr.amt.end(), 0);

    while(got < tr.n){
        if(!IN.getline_str(line)) return -1;

        if(line.rfind("FINISH",0)==0) return 1;
        if(line.rfind("INVALID",0)==0 || line.rfind("ERROR",0)==0) return -1;

        array<pair<int,int>,12> p;
        int cnt = split12(line, p);
        if(cnt < 8) continue; // not a market line

        string code(line.begin()+p[1].first, line.begin()+p[1].second);
        auto it = tr.mp.find(code);
        if(it == tr.mp.end()) continue; // log line with other text, skip

        int i = it->second;
        if(vis[i]) continue; // duplicate, ignore
        vis[i]=1; got++;

        bool ok;
        tr.op[i]  = parse_cents(line, p[2].first, p[2].second, ok); if(!ok) tr.op[i]=0;
        tr.hi[i]  = parse_cents(line, p[3].first, p[3].second, ok); if(!ok) tr.hi[i]=0;
        tr.lo[i]  = parse_cents(line, p[4].first, p[4].second, ok); if(!ok) tr.lo[i]=0;
        tr.cl[i]  = parse_cents(line, p[5].first, p[5].second, ok); if(!ok) tr.cl[i]=0;
        tr.amt[i] = parse_cents(line, p[7].first, p[7].second, ok); if(!ok) tr.amt[i]=0;
    }
    return 0;
}

int main(){
    Trader tr;
    string line;

    if(!IN.getline_str(line)) return 0;

    // INIT n D m L alpha com_min beta K_max
    {
        char tag[16];
        long long m=0;
        if(sscanf(line.c_str(), "%s %d %d %lld %d %lf %lf %lf %d",
                  tag, &tr.n, &tr.D, &m, &t
