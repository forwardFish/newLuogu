#include <iostream>
#include <string>
#include <vector>
#include <deque>
#include <unordered_map>
#include <array>
#include <sstream>
#include <cmath>
#include <algorithm>
#include <numeric>
#include <cctype>

using namespace std;

struct Order {
    bool buy;  // true BUY, false SELL
    int idx;
    int qty;   // shares
};

static inline bool is_sep(char c) {
    return c==' ' || c==',' || c=='\t' || c=='\r' || c=='\n';
}

// 从 [l,r) 解析两位小数价格为“分”，支持 NA
static inline long long parse_price_cents(const string &s, int l, int r, bool &ok) {
    ok = true;
    if (l >= r) { ok = false; return 0; }
    if (r - l == 2 && (tolower((unsigned char)s[l])=='n') && (tolower((unsigned char)s[l+1])=='a')) {
        ok = false; return 0;
    }

    long long int_part = 0;
    long long frac_part = 0;
    int frac_len = 0;
    bool dot = false;

    for (int i = l; i < r; i++) {
        char c = s[i];
        if (c == '.') { dot = true; continue; }
        if (c < '0' || c > '9') { ok = false; return 0; }
        int d = c - '0';
        if (!dot) int_part = int_part * 10 + d;
        else {
            if (frac_len < 2) {
                frac_part = frac_part * 10 + d;
                frac_len++;
            }
        }
    }

    if (!dot) { frac_part = 0; frac_len = 0; }
    if (frac_len == 0) frac_part *= 100;
    else if (frac_len == 1) frac_part *= 10;
    // frac_len==2 ok

    return int_part * 100 + frac_part;
}

// 从 [l,r) 解析整数（用于 volume）
static inline long long parse_int(const string &s, int l, int r) {
    long long v = 0;
    for (int i = l; i < r; i++) {
        char c = s[i];
        if (c < '0' || c > '9') return 0;
        v = v * 10 + (c - '0');
    }
    return v;
}

static inline int split12_pos(const string &line, array<pair<int,int>, 12> &pos12) {
    int cnt = 0;
    int n = (int)line.size();
    int i = 0;
    while (i < n && is_sep(line[i])) i++;
    while (i < n && cnt < 12) {
        int l = i;
        while (i < n && !is_sep(line[i])) i++;
        int r = i;
        pos12[cnt++] = {l, r};
        while (i < n && is_sep(line[i])) i++;
    }
    return cnt;
}

struct Trader {
    int n=200, D=0, L=100, Kmax=0;
    double alpha=0.0, com_min_yuan=0.0, beta=0.0;

    long long cash=0;                 // cents
    vector<long long> pos_shares;     // shares
    vector<long long> cost_cents;     // total cost cents for current position (rough)

    vector<string> codes;
    unordered_map<string,int> mp;

    vector<long long> openp, closep, amount_cents;
    vector<deque<long long> > close_hist;
    vector<deque<long long> > amount_hist;

    vector<Order> pending;
    int day = 0;

    // strategy params
    int lb_mom = 20, lb_rev = 5, lb_vol = 20;
    int hist_keep = 80;
    int rebalance_period = 5;
    int maxHold = 12;

    double stop_loss = 0.08;               // 8%
    long long liq_min_yuan = 3000000;      // 20日均成交额 >= 300万
    long long min_trade_yuan_mult = 20;    // 最小下单额 = max(2000, com_min*mult)

    long long commission(long long value_cents) const {
        long double v_yuan = (long double)value_cents / 100.0L;
        long double c = (long double)alpha * v_yuan;
        long double mn = (long double)com_min_yuan;
        long double use = (c < mn ? mn : c);
        return (long long) llround(use * 100.0L);
    }
    long long stamp(long long value_cents) const {
        long double v_yuan = (long double)value_cents / 100.0L;
        long double t = (long double)beta * v_yuan;
        return (long long) llround(t * 100.0L);
    }

    long long portfolio_value_at_close() const {
        long long v = cash;
        for (int i=0;i<n;i++){
            if (pos_shares[i] > 0 && closep[i] > 0) v += pos_shares[i] * closep[i];
        }
        return v;
    }

    long long min_trade_value_yuan() const {
        long long v1 = 2000;
        long long v2 = (long long) llround(com_min_yuan * (double)min_trade_yuan_mult);
        return max(v1, v2);
    }

    long long avg_amount(int i, int k) const {
        if ((int)amount_hist[i].size() < k) return 0;
        long long s = 0;
        for (int t=(int)amount_hist[i].size()-k; t<(int)amount_hist[i].size(); t++) s += amount_hist[i][t];
        return s / k;
    }

    bool parse_line(const string &line, string &code, long long &op, long long &cl, long long &amt) {
        array<pair<int,int>,12> p;
        int cnt = split12_pos(line, p);
        if (cnt < 8) return false;

        int lcode=p[1].first, rcode=p[1].second;
        code.assign(line.begin()+lcode, line.begin()+rcode);

        bool ok1=true, ok2=true, ok3=true;
        op  = parse_price_cents(line, p[2].first, p[2].second, ok1);
        cl  = parse_price_cents(line, p[5].first, p[5].second, ok2);
        amt = parse_price_cents(line, p[7].first, p[7].second, ok3);

        if(!ok1) op=0;
        if(!ok2) cl=0;
        if(!ok3) amt=0;
        return true;
    }

    void apply_pending_at_open() {
        if (pending.empty()) return;
        for (const auto &od: pending) {
            int i = od.idx, q = od.qty;
            long long p = openp[i];
            if (p <= 0) continue; // halted

            long long value = p * (long long)q;
            long long com = commission(value);

            if (od.buy) {
                long long cost = value + com;
                if (cash >= cost) {
                    cash -= cost;
                    cost_cents[i] += cost;
                    pos_shares[i] += q;
                }
            } else {
                if (pos_shares[i] >= q) {
                    long long tax = stamp(value);
                    long long gain = value - tax - com;
                    cash += gain;

                    long long old_pos = pos_shares[i];
                    if (old_pos > 0 && cost_cents[i] > 0) {
                        long long reduce_cost = (long long) llround((long double)cost_cents[i] * (long double)q / (long double)old_pos);
                        cost_cents[i] -= reduce_cost;
                        if (cost_cents[i] < 0) cost_cents[i] = 0;
                    }
                    pos_shares[i] -= q;
                    if (pos_shares[i] == 0) cost_cents[i] = 0;
                }
            }
        }
        pending.clear();
    }

    bool compute_score(int i, double &score, double &vol) {
        score = -1e100;
        vol = 1e9;

        int need = max(lb_mom, max(lb_rev, lb_vol)) + 1;
        if ((int)close_hist[i].size() < need) return false;

        const deque<long long> &h = close_hist[i];
        long double c0  = (long double)h.back();
        long double c20 = (long double)h[(int)h.size()-1-lb_mom];
        long double c5  = (long double)h[(int)h.size()-1-lb_rev];
        if (c0<=0 || c20<=0 || c5<=0) return false;

        long double r20 = log(c0/c20);
        long double r5  = log(c0/c5);

        vector<long double> rs;
        rs.reserve(lb_vol);
        for (int t=(int)h.size()-lb_vol; t<(int)h.size(); t++) {
            long double a=(long double)h[t], b=(long double)h[t-1];
            if (a<=0 || b<=0) return false;
            rs.push_back(log(a/b));
        }
        long double mean=0;
        for (auto x: rs) mean += x;
        mean /= (long double)rs.size();
        long double var=0;
        for (auto x: rs) {
            long double d=x-mean;
            var += d*d;
        }
        var /= (long double)rs.size();
        long double sd = sqrt(max((long double)0.0, var));

        long double w_mom=1.0L, w_rev=0.35L, w_vol=0.8L;
        long double sc = w_mom*r20 + w_rev*(-r5) - w_vol*sd;

        score = (double)sc;
        vol = (double)sd;
        return true;
    }

    vector<Order> build_orders() {
        vector<Order> out;
        if (day >= D) return out;

        int need = max(lb_mom, max(lb_rev, lb_vol)) + 1;
        int ok_cnt=0;
        for (int i=0;i<n;i++) if ((int)close_hist[i].size()>=need) ok_cnt++;
        if (ok_cnt < n/2) return out;

        // stop-loss
        vector<char> force_sell(n,0);
        for (int i=0;i<n;i++){
            if (pos_shares[i] <= 0 || closep[i] <= 0) continue;
            long long entry = 0;
            if (cost_cents[i] > 0 && pos_shares[i] > 0) {
                entry = (long long) llround((long double)cost_cents[i] / (long double)pos_shares[i]);
            }
            if (entry > 0) {
                long double dd = 1.0L - (long double)closep[i]/(long double)entry;
                if (dd >= (long double)stop_loss) force_sell[i]=1;
            }
        }

        bool do_rebalance = (day % rebalance_period == 0);

        if (!do_rebalance) {
            for (int i=0;i<n;i++){
                if (force_sell[i]) {
                    int qty = (int)(pos_shares[i]/L)*L;
                    if (qty>0) {
                        out.push_back(Order{false,i,qty});
                        if ((int)out.size()>=Kmax) break;
                    }
                }
            }
            return out;
        }

        struct Cand{ int i; double score; double vol; };
        vector<Cand> cands;
        cands.reserve(n);

        long long liq_th_cents = liq_min_yuan * 100LL;
        for (int i=0;i<n;i++){
            double sc, v;
            if (!compute_score(i, sc, v)) continue;
            if (closep[i] <= 0) continue;

            long long a20 = avg_amount(i, 20);
            if (a20 < liq_th_cents) continue;

            cands.push_back(Cand{i, sc, v});
        }

        if (cands.empty()) {
            for (int i=0;i<n;i++){
                if (pos_shares[i] > 0) {
                    int qty=(int)(pos_shares[i]/L)*L;
                    if (qty>0){
                        out.push_back(Order{false,i,qty});
                        if ((int)out.size()>=Kmax) break;
                    }
                }
            }
            return out;
        }

        sort(cands.begin(), cands.end(), [](const Cand& a, const Cand& b){ return a.score>b.score; });
        if ((int)cands.size() > maxHold) cands.resize(maxHold);

        vector<char> in_target(n,0);
        for (auto &c: cands) in_target[c.i]=1;

        // risk parity weights ~ 1/vol with cap
        vector<long double> w(n,0);
        long double sumw=0;
        for (auto &c: cands) {
            long double vv = (long double)c.vol;
            if (!(vv>1e-8L)) vv=1e-8L;
            long double wi = 1.0L / vv;
            w[c.i]=wi;
            sumw += wi;
        }
        if (sumw <= 0) return out;
        for (auto &c: cands) {
            w[c.i] /= sumw;
            if (w[c.i] > 0.15L) w[c.i] = 0.15L;
        }
        long double s2=0;
        for (auto &c: cands) s2 += w[c.i];
        if (s2>0) for (auto &c: cands) w[c.i] /= s2;

        long long pv = portfolio_value_at_close();
        vector<long long> target_sh(n,0);

        long long minTradeY = min_trade_value_yuan();

        for (auto &c: cands) {
            int i=c.i;
            long long price = closep[i];
            if (price<=0) continue;
            long double tv = (long double)pv * w[i]; // cents
            long long shares = (long long) floor(tv / (long double)price);
            shares = (shares / L) * L;
            if (shares>0 && shares*price < minTradeY*100LL) shares = 0;
            target_sh[i]=shares;
        }

        for (int i=0;i<n;i++) if (force_sell[i]) target_sh[i]=0;

        vector<Order> sells, buys;
        sells.reserve(n); buys.reserve(n);

        for (int i=0;i<n;i++){
            long long cur=pos_shares[i], tar=target_sh[i];
            if (cur > tar){
                long long diff = (cur-tar)/L*L;
                if (diff<=0) continue;
                if (closep[i]>0 && diff*closep[i] < minTradeY*100LL) continue;
                sells.push_back(Order{false,i,(int)diff});
            }
        }
        for (int i=0;i<n;i++){
            long long cur=pos_shares[i], tar=target_sh[i];
            if (tar > cur){
                long long diff = (tar-cur)/L*L;
                if (diff<=0) continue;
                if (closep[i]>0 && diff*closep[i] < minTradeY*100LL) continue;
                buys.push_back(Order{true,i,(int)diff});
            }
        }

        // local sim with close as est-open
        long long sim_cash = cash;
        vector<long long> sim_pos = pos_shares;

        auto try_append = [&](const Order &od)->bool{
            if ((int)out.size() >= Kmax) return false;
            int i=od.idx, q=od.qty;
            long long p=closep[i];
            if (p<=0) return true;
            long long value=p*(long long)q;
            long long com=commission(value);

            if (od.buy){
                long long cost=value+com;
                long long buf=(long long) llround((long double)cost*1.01L);
                if (sim_cash>=buf){
                    sim_cash-=cost;
                    sim_pos[i]+=q;
                    out.push_back(od);
                }
            }else{
                if (sim_pos[i]>=q){
                    long long tax=stamp(value);
                    long long gain=value-tax-com;
                    sim_cash+=gain;
                    sim_pos[i]-=q;
                    out.push_back(od);
                }
            }
            return true;
        };

        for (auto &od: sells) { if (!try_append(od)) break; }
        for (auto &od: buys)  { if (!try_append(od)) break; }

        return out;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    Trader tr;
    string line;
    if (!getline(cin, line)) return 0;

    {
        string tag;
        long long m_yuan=0;
        stringstream ss(line);
        ss >> tag;
        if (tag != "INIT") return 0;
        ss >> tr.n >> tr.D >> m_yuan >> tr.L >> tr.alpha >> tr.com_min_yuan >> tr.beta >> tr.Kmax;

        tr.cash = m_yuan * 100LL;
        tr.pos_shares.assign(tr.n, 0);
        tr.cost_cents.assign(tr.n, 0);

        tr.codes.assign(tr.n, "");
        tr.openp.assign(tr.n, 0);
        tr.closep.assign(tr.n, 0);
        tr.amount_cents.assign(tr.n, 0);

        tr.close_hist.assign(tr.n, deque<long long>());
        tr.amount_hist.assign(tr.n, deque<long long>());

        tr.mp.reserve(tr.n*2);
    }

    // read day0
    for (int i=0;i<tr.n;i++){
        if (!getline(cin, line)) return 0;
        string code;
        long long op, cl, amt;
        if (!tr.parse_line(line, code, op, cl, amt)) return 0;
        tr.codes[i]=code;
        tr.mp[code]=i;
        tr.openp[i]=op;
        tr.closep[i]=cl;
        tr.amount_cents[i]=amt;
        if (cl>0) tr.close_hist[i].push_back(cl);
        if (amt>0) tr.amount_hist[i].push_back(amt);
    }
    tr.day=0;

    while (true) {
        vector<Order> orders = tr.build_orders();
        if ((int)orders.size() > tr.Kmax) orders.resize(tr.Kmax);

        for (const auto &od: orders) {
            const string &code = tr.codes[od.idx];
            if (od.buy) cout << "BUY "  << code << " " << od.qty << "\n";
            else        cout << "SELL " << code << " " << od.qty << "\n";
        }
        cout << "DONE\n";
        cout.flush();

        tr.pending = orders;

        if (!getline(cin, line)) return 0;

        if (line.rfind("FINISH", 0) == 0) return 0;
        if (line.rfind("ERROR", 0) == 0 || line.rfind("INVALID", 0) == 0) return 0;

        // read next day market
        tr.day += 1;
        fill(tr.openp.begin(), tr.openp.end(), 0);
        fill(tr.closep.begin(), tr.closep.end(), 0);
        fill(tr.amount_cents.begin(), tr.amount_cents.end(), 0);

        auto read_one = [&](const string &ln)->bool{
            string code;
            long long op, cl, amt;
            if (!tr.parse_line(ln, code, op, cl, amt)) return false;
            auto it = tr.mp.find(code);
            if (it == tr.mp.end()) return false;
            int idx = it->second;
            tr.openp[idx]=op;
            tr.closep[idx]=cl;
            tr.amount_cents[idx]=amt;
            return true;
        };

        if (!read_one(line)) return 0;
        for (int k=1;k<tr.n;k++){
            if (!getline(cin, line)) return 0;
            if (!read_one(line)) return 0;
        }

        // execute pending at today's open
        tr.apply_pending_at_open();

        // update history
        for (int i=0;i<tr.n;i++){
            if (tr.closep[i] > 0) {
                tr.close_hist[i].push_back(tr.closep[i]);
                while ((int)tr.close_hist[i].size() > tr.hist_keep) tr.close_hist[i].pop_front();
            }
            if (tr.amount_cents[i] > 0) {
                tr.amount_hist[i].push_back(tr.amount_cents[i]);
                while ((int)tr.amount_hist[i].size() > tr.hist_keep) tr.amount_hist[i].pop_front();
            }
        }
    }
    return 0;
}
