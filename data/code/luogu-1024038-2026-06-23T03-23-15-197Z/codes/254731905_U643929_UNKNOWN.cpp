#include <bits/stdc++.h>
using namespace std;

struct Order {
    bool buy;   // true BUY, false SELL
    int idx;
    int qty;    // shares
};

static inline bool is_sep(char c) {
    return c==' '||c==','||c=='\t'||c=='\r'||c=='\n';
}

// parse decimal string to cents (rounded by trunc since input is 2 decimals for prices; for amount may be integer)
static inline long long parse_decimal_to_cents(string_view sv, bool &ok) {
    ok = true;
    if (sv.empty()) { ok=false; return 0; }
    if ((sv.size()==2) && (tolower(sv[0])=='n') && (tolower(sv[1])=='a')) { ok=false; return 0; }

    long long int_part=0, frac_part=0;
    int frac_len=0;
    bool dot=false;

    for(char c: sv){
        if(c=='.'){ dot=true; continue; }
        if(c<'0'||c>'9'){ ok=false; return 0; }
        int d=c-'0';
        if(!dot) int_part = int_part*10 + d;
        else {
            if(frac_len<2){
                frac_part = frac_part*10 + d;
                frac_len++;
            }
        }
    }
    if(!dot) { frac_part=0; frac_len=0; }
    if(frac_len==0) frac_part*=100;
    else if(frac_len==1) frac_part*=10;
    // frac_len==2 ok
    return int_part*100 + frac_part;
}

// tokenize first 12 fields
static inline int split12(const string &line, array<string_view,12> &f){
    int cnt=0;
    size_t n=line.size();
    size_t i=0;
    while(i<n && is_sep(line[i])) i++;
    while(i<n && cnt<12){
        size_t j=i;
        while(j<n && !is_sep(line[j])) j++;
        f[cnt++] = string_view(line.data()+i, j-i);
        i=j;
        while(i<n && is_sep(line[i])) i++;
    }
    return cnt;
}

struct Trader {
    int n=200, D=0, L=100, Kmax=0;
    double alpha=0.0, com_min_yuan=0.0, beta=0.0;

    long long cash=0; // cents
    vector<long long> pos; // shares

    vector<string> codes;
    unordered_map<string,int> mp;

    vector<long long> openp, closep;      // cents
    vector<long long> amount_cents;       // cents (成交额)
    vector<deque<long long>> close_hist;  // cents

    // cost basis for stop-loss (avg entry)
    vector<long long> cost_cents; // total cost in cents for current position (rough bookkeeping)

    vector<Order> pending;
    int day=0; // received day index (0..D)

    // params
    int lb_mom = 20;
    int lb_rev = 5;
    int lb_vol = 20;
    int hist_keep = 80;

    int rebalance_period = 5;
    int maxHold = 12;

    double stop_loss = 0.08;          // 8%
    double keep_score_th = -1e9;      // keep threshold (set by logic below)

    long long liq_min_yuan = 3000000; // 20日均成交额门槛：300万
    long long min_trade_yuan_mult = 20; // 最小下单额 = max(2000, com_min*mult)

    long long commission(long long value_cents) const {
        long double v_yuan = (long double)value_cents/100.0L;
        long double c = alpha * v_yuan;
        long double mn = (long double)com_min_yuan;
        long double use = (c<mn? mn : c);
        return (long long) llround(use*100.0L);
    }
    long long stamp(long long value_cents) const {
        long double v_yuan = (long double)value_cents/100.0L;
        long double t = beta * v_yuan;
        return (long long) llround(t*100.0L);
    }

    long long portfolio_value_at_close() const {
        long long v = cash;
        for(int i=0;i<n;i++){
            if(pos[i]>0 && closep[i]>0) v += pos[i]*closep[i];
        }
        return v;
    }

    // apply pending at today's open
    void apply_pending_at_open(){
        if(pending.empty()) return;
        for(const auto &od: pending){
            int i=od.idx, q=od.qty;
            long long p = openp[i];
            if(p<=0) continue; // halted
            long long value = p*(long long)q;
            long long com = commission(value);
            if(od.buy){
                long long cost = value + com;
                if(cash >= cost){
                    cash -= cost;
                    // update cost basis (treat cost includes commission; ok for stop-loss roughness)
                    cost_cents[i] += cost;
                    pos[i] += q;
                }
            }else{
                if(pos[i] >= q){
                    long long tax = stamp(value);
                    long long gain = value - tax - com;
                    cash += gain;

                    // reduce cost basis proportionally
                    if(pos[i]>0){
                        long long old_pos = pos[i];
                        long long reduce_cost = (long long) llround((long double)cost_cents[i] * (long double)q / (long double)old_pos);
                        cost_cents[i] -= reduce_cost;
                        if(cost_cents[i]<0) cost_cents[i]=0;
                    }
                    pos[i] -= q;
                    if(pos[i]==0) cost_cents[i]=0;
                }
            }
        }
        pending.clear();
    }

    bool parse_line(const string &line, string &code,
                    long long &op, long long &cl, long long &amt){
        array<string_view,12> f;
        int cnt = split12(line, f);
        if(cnt < 8) return false;
        code.assign(f[1].data(), f[1].size());
        bool ok1=true, ok2=true, ok3=true;
        op = parse_decimal_to_cents(f[2], ok1);
        cl = parse_decimal_to_cents(f[5], ok2);
        amt = parse_decimal_to_cents(f[7], ok3); // amount
        if(!ok1) op=0;
        if(!ok2) cl=0;
        if(!ok3) amt=0;
        return true;
    }

    // compute avg amount over last k days (need amount history? we only have today's amount.
    // Here we approximate liquidity by using close_hist + today's amount via a simple rolling sum stored externally.
    vector<deque<long long>> amount_hist; // cents
    long long avg_amount(int i, int k) const {
        if((int)amount_hist[i].size() < k) return 0;
        long long s=0;
        for(int t=(int)amount_hist[i].size()-k; t<(int)amount_hist[i].size(); t++) s += amount_hist[i][t];
        return s / k;
    }

    // compute score: 20d momentum + 5d reversal - vol penalty
    bool compute_score(int i, double &score, double &vol){
        score = -1e100;
        vol = 1e9;
        auto &h = close_hist[i];
        int need = max({lb_mom, lb_rev, lb_vol}) + 1;
        if((int)h.size() < need) return false;

        long double c0 = (long double)h.back();
        long double c20 = (long double)h[(int)h.size()-1-lb_mom];
        long double c5  = (long double)h[(int)h.size()-1-lb_rev];
        if(c0<=0 || c20<=0 || c5<=0) return false;

        long double r20 = log(c0/c20);
        long double r5  = log(c0/c5);

        // vol of daily log returns over last lb_vol days
        vector<long double> rs;
        rs.reserve(lb_vol);
        for(int t=(int)h.size()-lb_vol; t<(int)h.size(); t++){
            long double a = (long double)h[t];
            long double b = (long double)h[t-1];
            if(a<=0 || b<=0) return false;
            rs.push_back(log(a/b));
        }
        long double mean=0;
        for(auto x: rs) mean += x;
        mean /= (long double)rs.size();
        long double var=0;
        for(auto x: rs){
            long double d = x-mean;
            var += d*d;
        }
        var /= (long double)rs.size();
        long double sd = sqrt(max((long double)0.0, var));

        // weights (tunable)
        long double w_mom = 1.0L;
        long double w_rev = 0.35L;
        long double w_vol = 0.8L;

        // reversal term: prefer recent小回撤（-r5为正表示最近下跌）
        long double sc = w_mom*r20 + w_rev*(-r5) - w_vol*sd;

        score = (double)sc;
        vol   = (double)sd;
        return true;
    }

    // estimate minimal trade value (yuan)
    long long min_trade_value_yuan() const {
        long long v1 = 2000; // base
        long long v2 = (long long) llround(com_min_yuan * (double)min_trade_yuan_mult);
        return max(v1, v2);
    }

    vector<Order> build_orders(){
        vector<Order> out;
        if(day>=D) return out;

        // warmup：至少需要 20+ 天历史
        int need = max({lb_mom, lb_rev, lb_vol}) + 1;
        int ok_cnt=0;
        for(int i=0;i<n;i++) if((int)close_hist[i].size()>=need) ok_cnt++;
        if(ok_cnt < n/2) return out;

        // daily stop-loss / forced exit: even when not rebalance day
        vector<char> force_sell(n,0);
        for(int i=0;i<n;i++){
            if(pos[i]<=0) continue;
            if(closep[i]<=0) continue;

            // average entry price estimate
            long long entry = 0;
            if(pos[i]>0 && cost_cents[i]>0) entry = (long long) llround((long double)cost_cents[i] / (long double)pos[i]);
            if(entry>0){
                long double dd = 1.0L - (long double)closep[i]/(long double)entry;
                if(dd >= (long double)stop_loss) force_sell[i]=1;
            }
        }

        bool do_rebalance = (day % rebalance_period == 0);

        // If not rebalance, only stop-loss sells
        if(!do_rebalance){
            for(int i=0;i<n;i++){
                if(force_sell[i]){
                    int qty = (int)(pos[i]/L)*L;
                    if(qty>0){
                        out.push_back(Order{false,i,qty});
                        if((int)out.size()>=Kmax) break;
                    }
                }
            }
            return out;
        }

        // --- Rebalance day ---
        struct Cand { int i; double score; double vol; };
        vector<Cand> cands;
        cands.reserve(n);

        long long liq_th_cents = liq_min_yuan * 100LL;
        for(int i=0;i<n;i++){
            double sc, v;
            if(!compute_score(i, sc, v)) continue;
            if(closep[i]<=0) continue;

            // liquidity filter: 20日均成交额
            long long a20 = avg_amount(i, 20);
            if(a20 < liq_th_cents) continue;

            cands.push_back(Cand{i, sc, v});
        }

        if(cands.empty()){
            // if nothing passes, de-risk: sell all (except halted risk). This usually stabilizes score.
            for(int i=0;i<n;i++){
                if(pos[i]>0){
                    int qty=(int)(pos[i]/L)*L;
                    if(qty>0){
                        out.push_back(Order{false,i,qty});
                        if((int)out.size()>=Kmax) break;
                    }
                }
            }
            return out;
        }

        sort(cands.begin(), cands.end(), [](const Cand& a, const Cand& b){
            return a.score > b.score;
        });
        if((int)cands.size() > maxHold) cands.resize(maxHold);

        vector<char> in_target(n,0);
        for(auto &c: cands) in_target[c.i]=1;

        // target weights: risk parity ~ 1/vol, with cap
        vector<long double> w(n,0);
        long double sumw=0;
        for(auto &c: cands){
            long double vv = (long double)c.vol;
            if(!(vv>1e-8L)) vv = 1e-8L;
            long double wi = 1.0L / vv;
            w[c.i]=wi;
            sumw += wi;
        }
        if(sumw<=0) return out;
        for(auto &c: cands){
            w[c.i] /= sumw;
            // cap 15%
            if(w[c.i] > 0.15L) w[c.i] = 0.15L;
        }
        // re-normalize after cap
        long double s2=0;
        for(auto &c: cands) s2 += w[c.i];
        if(s2>0){
            for(auto &c: cands) w[c.i] /= s2;
        }

        // compute target shares using close as estimate
        long long pv = portfolio_value_at_close();
        vector<long long> target_sh(n,0);

        for(auto &c: cands){
            int i=c.i;
            long long price = closep[i];
            if(price<=0) continue;
            long double tv = (long double)pv * w[i]; // cents
            long long shares = (long long) floor(tv / (long double)price);
            shares = (shares / L) * L;
            // avoid tiny positions
            long long minTradeY = min_trade_value_yuan();
            if((shares>0) && (shares*price < minTradeY*100LL)) shares = 0;
            target_sh[i]=shares;
        }

        // stop-loss overrides: target to 0
        for(int i=0;i<n;i++){
            if(force_sell[i]) target_sh[i]=0;
        }

        // Build sells first
        vector<Order> sells, buys;
        sells.reserve(n);
        buys.reserve(n);

        long long minTradeY = min_trade_value_yuan();

        for(int i=0;i<n;i++){
            long long cur = pos[i];
            long long tar = target_sh[i];
            if(cur > tar){
                long long diff = cur - tar;
                diff = (diff / L) * L;
                if(diff<=0) continue;
                // avoid tiny sells too (optional)
                if(closep[i]>0 && diff*closep[i] < minTradeY*100LL) continue;
                sells.push_back(Order{false,i,(int)diff});
            }
        }

        // Then buys
        for(int i=0;i<n;i++){
            long long cur = pos[i];
            long long tar = target_sh[i];
            if(tar > cur){
                long long diff = tar - cur;
                diff = (diff / L) * L;
                if(diff<=0) continue;
                if(closep[i]>0 && diff*closep[i] < minTradeY*100LL) continue;
                buys.push_back(Order{true,i,(int)diff});
            }
        }

        // Sequence: sells then buys. Also do a local cash simulation using close as est open.
        long long sim_cash = cash;
        vector<long long> sim_pos = pos;

        auto try_append = [&](const Order &od)->bool{
            if((int)out.size() >= Kmax) return false;
            int i=od.idx, q=od.qty;
            long long p = closep[i];
            if(p<=0) return true; // skip silently by not appending
            long long value = p*(long long)q;
            long long com = commission(value);

            if(od.buy){
                long long cost = value + com;
                // buffer 1%
                long long cost_buf = (long long) llround((long double)cost * 1.01L);
                if(sim_cash >= cost_buf){
                    sim_cash -= cost;
                    sim_pos[i] += q;
                    out.push_back(od);
                }
            }else{
                if(sim_pos[i] >= q){
                    long long tax = stamp(value);
                    long long gain = value - tax - com;
                    sim_cash += gain;
                    sim_pos[i] -= q;
                    out.push_back(od);
                }
            }
            return true;
        };

        // append sells
        for(const auto &od: sells){
            if(!try_append(od)) break;
        }
        // append buys
        for(const auto &od: buys){
            if(!try_append(od)) break;
        }

        return out;
    }
};

int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    Trader tr;
    string line;
    if(!getline(cin,line)) return 0;

    {
        string tag;
        long long m_yuan=0;
        stringstream ss(line);
        ss >> tag;
        if(tag!="INIT") return 0;
        ss >> tr.n >> tr.D >> m_yuan >> tr.L >> tr.alpha >> tr.com_min_yuan >> tr.beta >> tr.Kmax;

        tr.cash = m_yuan * 100LL;
        tr.pos.assign(tr.n, 0);
        tr.codes.assign(tr.n, "");
        tr.openp.assign(tr.n, 0);
        tr.closep.assign(tr.n, 0);
        tr.amount_cents.assign(tr.n, 0);
        tr.close_hist.assign(tr.n, deque<long long>());
        tr.amount_hist.assign(tr.n, deque<long long>());
        tr.cost_cents.assign(tr.n, 0);
        tr.mp.reserve(tr.n*2);
    }

    // read day0 (n lines)
    for(int i=0;i<tr.n;i++){
        if(!getline(cin,line)) return 0;
        string code;
        long long op, cl, amt;
        if(!tr.parse_line(line, code, op, cl, amt)) return 0;
        tr.codes[i]=code;
        tr.mp[code]=i;
        tr.openp[i]=op;
        tr.closep[i]=cl;
        tr.amount_cents[i]=amt;
        if(cl>0) tr.close_hist[i].push_back(cl);
        if(amt>0) tr.amount_hist[i].push_back(amt);
    }
    tr.day=0;

    while(true){
        // build orders based on last received day (day=0..D)
        vector<Order> orders = tr.build_orders();
        if((int)orders.size() > tr.Kmax) orders.resize(tr.Kmax);

        for(const auto &od: orders){
            const string &code = tr.codes[od.idx];
            if(od.buy) cout << "BUY " << code << " " << od.qty << "\n";
            else       cout << "SELL " << code << " " << od.qty << "\n";
        }
        cout << "DONE\n";
        cout.flush();

        tr.pending = orders;

        if(!getline(cin,line)) return 0;

        if(line.rfind("FINISH",0)==0) return 0;
        if(line.rfind("ERROR",0)==0 || line.rfind("INVALID",0)==0) return 0;

        // read day (tr.day+1) market: first line already in 'line'
        tr.day += 1;
        fill(tr.openp.begin(), tr.openp.end(), 0);
        fill(tr.closep.begin(), tr.closep.end(), 0);
        fill(tr.amount_cents.begin(), tr.amount_cents.end(), 0);

        auto read_one = [&](const string &ln)->bool{
            string code;
            long long op, cl, amt;
            if(!tr.parse_line(ln, code, op, cl, amt)) return false;
            auto it = tr.mp.find(code);
            if(it==tr.mp.end()) return false;
            int idx = it->second;
            tr.openp[idx]=op;
            tr.closep[idx]=cl;
            tr.amount_cents[idx]=amt;
            return true;
        };

        if(!read_one(line)) return 0;
        for(int k=1;k<tr.n;k++){
            if(!getline(cin,line)) return 0;
            if(!read_one(line)) return 0;
        }

        // execute pending at today's open
        tr.apply_pending_at_open();

        // update histories
        for(int i=0;i<tr.n;i++){
            if(tr.closep[i]>0){
                tr.c
