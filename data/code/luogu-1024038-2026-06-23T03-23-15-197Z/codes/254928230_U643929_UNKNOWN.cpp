#include <bits/stdc++.h>
using namespace std;

using i64 = long long;
using i128 = __int128_t;

struct Order { bool buy; int idx; int qty; };

static inline bool is_sep(char c){ return c==' '||c==','||c=='\t'||c=='\r'||c=='\n'; }

// ---------- fast input (fread-based line reader) ----------
struct FastIn {
    static const int SZ = 1<<20;
    int i=0,n=0; char b[SZ];
    inline char gc(){
        if(i>=n){ n=(int)fread(b,1,SZ,stdin); i=0; if(!n) return 0; }
        return b[i++];
    }
    bool getline_str(string &s){
        s.clear();
        char c=gc(); if(!c) return false;
        while(c=='\r') c=gc();
        while(c && c!='\n'){ s.push_back(c); c=gc(); }
        if(!s.empty() && s.back()=='\r') s.pop_back();
        return true;
    }
} IN;

// parse decimal [l,r) to cents; support NA
static inline i64 parse_cents(const string &s, int l, int r, bool &ok){
    ok=true;
    if(l>=r){ ok=false; return 0; }
    if(r-l==2 && (tolower((unsigned char)s[l])=='n') && (tolower((unsigned char)s[l+1])=='a')){
        ok=false; return 0;
    }
    i64 ip=0, fp=0; int fl=0; bool dot=false;
    for(int i=l;i<r;i++){
        char c=s[i];
        if(c=='.'){ dot=true; continue; }
        if(c<'0'||c>'9'){ ok=false; return 0; }
        int d=c-'0';
        if(!dot) ip=ip*10+d;
        else if(fl<2){ fp=fp*10+d; fl++; }
    }
    if(!dot){ fp=0; fl=0; }
    if(fl==0) fp*=100;
    else if(fl==1) fp*=10;
    return ip*100+fp;
}

static inline int split12(const string &line, array<pair<int,int>,12> &pos){
    int cnt=0, n=(int)line.size(), i=0;
    while(i<n && is_sep(line[i])) i++;
    while(i<n && cnt<12){
        int l=i;
        while(i<n && !is_sep(line[i])) i++;
        int r=i;
        pos[cnt++]={l,r};
        while(i<n && is_sep(line[i])) i++;
    }
    return cnt;
}

static inline void fast_print_order(const char* typ, const string &code, int qty){
    // printf faster than iostream in interactive
    printf("%s %s %d\n", typ, code.c_str(), qty);
}

struct StockState {
    // EMA
    bool ema_init=false;
    double ema20=0.0, ema60=0.0;

    // ATR14
    deque<double> tr_q;
    double tr_sum=0.0; // rolling sum
    double atr=0.0;

    // VOL20 (log returns)
    deque<double> lr_q;
    double lr_sum=0.0, lr_sumsq=0.0; // rolling
    double vol=0.0;

    // MOM60: keep closes for ratio
    deque<i64> close_q; // cents, keep 61
    double mom= -1e100;

    // LIQ20: rolling avg amount
    deque<i64> amt_q; // cents
    i128 amt_sum=0;

    // Max55 excluding today: monotonic queue of (dayIndex, close)
    deque<pair<int,i64>> max55_q;

    // trailing peak for stop
    i64 peak_close=0;

    // last close for TR/logret
    i64 last_close=0;
    bool have_last=false;
};

struct Trader {
    int n=200, D=0, L=100, Kmax=0;
    double alpha=0.0, com_min=0.0, beta=0.0;

    i64 cash=0;                 // cents
    vector<i64> pos_shares;     // shares
    vector<i64> cost_cents;     // rough

    vector<string> codes;
    unordered_map<string,int> mp;

    // today market
    vector<i64> op, hi, lo, cl, amt;

    vector<StockState> st;
    vector<Order> pending;
    int day=0; // received day index, day0=0

    // strategy params (fast + concentrated)
    int LB_BREAK=55, LB_MOM=60, LB_VOL=20, LB_ATR=14, LB_LIQ=20;
    int rebalance_period=5;
    int maxHold=4;

    long long liq_min_yuan=5000000;  // 20d avg amount >= 500万
    long long min_trade_yuan=5000;   // ignore tiny orders
    double atr_stop_k=3.0;           // close < peak - k*ATR => exit
    double ema_stop_k=1.0;           // close < EMA20*ema_stop_k => exit
    double mom_w=2.2, vol_w=1.4;     // score weights

    i64 commission(i64 value_cents) const {
        long double v = (long double)value_cents/100.0L;
        long double c = (long double)alpha * v;
        long double mn= (long double)com_min;
        long double use = (c<mn? mn:c);
        return (i64) llround(use*100.0L);
    }
    i64 stamp(i64 value_cents) const {
        long double v = (long double)value_cents/100.0L;
        long double t = (long double)beta * v;
        return (i64) llround(t*100.0L);
    }

    bool parse_line(const string &line){
        array<pair<int,int>,12> p;
        int cnt=split12(line,p);
        if(cnt<8) return false;
        string code(line.begin()+p[1].first, line.begin()+p[1].second);
        auto it=mp.find(code);
        if(it==mp.end()) return false;
        int i=it->second;
        bool ok;
        op[i]=parse_cents(line,p[2].first,p[2].second,ok); if(!ok) op[i]=0;
        hi[i]=parse_cents(line,p[3].first,p[3].second,ok); if(!ok) hi[i]=0;
        lo[i]=parse_cents(line,p[4].first,p[4].second,ok); if(!ok) lo[i]=0;
        cl[i]=parse_cents(line,p[5].first,p[5].second,ok); if(!ok) cl[i]=0;
        amt[i]=parse_cents(line,p[7].first,p[7].second,ok); if(!ok) amt[i]=0;
        return true;
    }

    void apply_pending_open(){
        for(const auto &od: pending){
            int i=od.idx, q=od.qty;
            i64 p=op[i];
            if(p<=0) continue;
            i64 value=p*(i64)q;
            i64 com=commission(value);
            if(od.buy){
                i64 cost=value+com;
                if(cash>=cost){
                    cash-=cost;
                    cost_cents[i]+=cost;
                    pos_shares[i]+=q;
                }
            }else{
                if(pos_shares[i]>=q){
                    i64 tax=stamp(value);
                    i64 gain=value-tax-com;
                    cash+=gain;
                    // reduce cost rough
                    i64 old=pos_shares[i];
                    if(old>0 && cost_cents[i]>0){
                        i64 red=(i64) llround((long double)cost_cents[i]*(long double)q/(long double)old);
                        cost_cents[i]-=red; if(cost_cents[i]<0) cost_cents[i]=0;
                    }
                    pos_shares[i]-=q;
                    if(pos_shares[i]==0){
                        cost_cents[i]=0;
                        st[i].peak_close=0;
                    }
                }
            }
        }
        pending.clear();
    }

    // O(1) update per stock per day
    void update_indicators(int i){
        auto &s = st[i];
        i64 C = cl[i], H=hi[i], L=lo[i], A=amt[i];

        // max55 prev max excluding today
        i64 prev_max55 = 0;
        if(!s.max55_q.empty()) prev_max55 = s.max55_q.front().second;
        // we will later use breakout = (C>=prev_max55) when selecting, but only meaningful when queue length >=55

        // EMA
        if(C>0){
            double a20 = 2.0/(20.0+1.0);
            double a60 = 2.0/(60.0+1.0);
            if(!s.ema_init){
                s.ema20 = (double)C;
                s.ema60 = (double)C;
                s.ema_init=true;
            }else{
                s.ema20 = a20*(double)C + (1.0-a20)*s.ema20;
                s.ema60 = a60*(double)C + (1.0-a60)*s.ema60;
            }
        }

        // ATR14: needs prev close
        if(s.have_last && s.last_close>0 && H>0 && L>0){
            double pc = (double)s.last_close;
            double tr = max((double)(H-L), max(fabs((double)H-pc), fabs((double)L-pc)));
            s.tr_q.push_back(tr);
            s.tr_sum += tr;
            if((int)s.tr_q.size() > LB_ATR){
                s.tr_sum -= s.tr_q.front();
                s.tr_q.pop_front();
            }
            if((int)s.tr_q.size() == LB_ATR) s.atr = s.tr_sum / (double)LB_ATR;
        }

        // VOL20 + MOM60: needs prev close
        if(s.have_last && s.last_close>0 && C>0){
            double lr = log((double)C / (double)s.last_close);
            s.lr_q.push_back(lr);
            s.lr_sum += lr;
            s.lr_sumsq += lr*lr;
            if((int)s.lr_q.size() > LB_VOL){
                double x = s.lr_q.front();
                s.lr_q.pop_front();
                s.lr_sum -= x;
                s.lr_sumsq -= x*x;
            }
            if((int)s.lr_q.size() == LB_VOL){
                double m = s.lr_sum / (double)LB_VOL;
                double v = s.lr_sumsq / (double)LB_VOL - m*m;
                if(v < 0) v = 0;
                s.vol = sqrt(v);
            }
        }

        // momentum 60: keep 61 closes
        if(C>0){
            s.close_q.push_back(C);
            if((int)s.close_q.size() > LB_MOM+1) s.close_q.pop_front();
            if((int)s.close_q.size() == LB_MOM+1){
                i64 old = s.close_q.front();
                if(old>0) s.mom = log((double)C / (double)old);
            }
        }

        // liquidity avg amount 20
        if(A>0){
            s.amt_q.push_back(A);
            s.amt_sum += (i128)A;
            if((int)s.amt_q.size() > LB_LIQ){
                s.amt_sum -= (i128)s.amt_q.front();
                s.amt_q.pop_front();
            }
        }

        // max55 monotonic queue: drop old (day-LB_BREAK)
        if(C>0){
            // pop outdated
            while(!s.max55_q.empty() && s.max55_q.front().first <= day - LB_BREAK) s.max55_q.pop_front();
            // maintain decreasing
            while(!s.max55_q.empty() && s.max55_q.back().second <= C) s.max55_q.pop_back();
            s.max55_q.push_back({day, C});
        }

        // update last close
        if(C>0){
            s.last_close = C;
            s.have_last = true;
        }
    }

    i64 portfolio_value_close() const {
        i64 v=cash;
        for(int i=0;i<n;i++) if(pos_shares[i]>0 && cl[i]>0) v += pos_shares[i]*cl[i];
        return v;
    }

    // fast selection score (no loops, all O(1) fields)
    bool get_score(int i, double &score, bool &is_break){
        auto &s=st[i];
        if(cl[i]<=0) return false;
        if(!s.ema_init) return false;
        if((int)s.close_q.size() < LB_MOM+1) return false;
        if((int)s.lr_q.size() < LB_VOL) return false;
        if((int)s.amt_q.size() < LB_LIQ) return false;
        if((int)s.max55_q.empty()) return false;

        // liquidity filter
        long long avg_amt_cents = (long long)(s.amt_sum / (i128)LB_LIQ);
        if(avg_amt_cents < (long long)liq_min_yuan*100LL) return false;

        // breakout: today close >= prev max55 (excluding today)
        // Our max55_q includes today already; to exclude today, we need prev max before pushing.
        // To keep it O(1), approximate by requiring close >= max55_q.front (which may be today itself).
        // Better: require day>=LB_BREAK and close == max over window => close >= front is ok in practice for breakout.
        is_break = (cl[i] >= st[i].max55_q.front().second);

        // trend filter
        bool trend = (s.ema20 > s.ema60);
        if(!trend) return false;

        score = mom_w * s.mom - vol_w * s.vol + (is_break ? 0.6 : 0.0);
        return true;
    }

    vector<Order> build_orders(){
        vector<Order> out;
        if(day>=D) return out;
        if(day==D) return out; // last day: usually best do nothing

        // 1) exits always (O(n))
        vector<Order> sells;
        sells.reserve(n);
        for(int i=0;i<n;i++){
            if(pos_shares[i]<=0 || cl[i]<=0) continue;
            auto &s=st[i];
            s.peak_close = max(s.peak_close, cl[i]);

            bool exit=false;
            if(s.atr>0.0){
                double thr = (double)s.peak_close - atr_stop_k * s.atr;
                if((double)cl[i] < thr) exit=true;
            }
            if(s.ema_init && (double)cl[i] < s.ema20 * ema_stop_k) exit=true;

            if(exit){
                int qty=(int)(pos_shares[i]/L)*L;
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

        // 2) pick targets (O(n log n), n=200)
        struct Cand{ int i; double sc; };
        vector<Cand> cands; cands.reserve(n);
        for(int i=0;i<n;i++){
            double sc; bool br;
            if(get_score(i, sc, br)){
                cands.push_back({i, sc});
            }
        }
        sort(cands.begin(), cands.end(), [](const Cand&a,const Cand&b){ return a.sc>b.sc; });
        if((int)cands.size()>maxHold) cands.resize(maxHold);

        vector<char> inT(n,0);
        for(auto &c:cands) inT[c.i]=1;

        // 3) target shares: equal weight concentrated (fast, avoids exp)
        i64 pv = portfolio_value_close();
        i64 invest = (i64) llround((long double)pv * 0.95L);
        int k = (int)cands.size();
        vector<i64> target(n,0);
        if(k>0){
            i64 per = invest / k;
            for(auto &c:cands){
                int i=c.i;
                if(cl[i]<=0) continue;
                i64 sh = (per / cl[i]);
                sh = (sh / L) * L;
                if(sh>0 && sh*cl[i] < (i64)min_trade_yuan*100LL) sh=0;
                target[i]=sh;
            }
        }

        // exits override
        for(auto &od:sells) target[od.idx]=0;

        // 4) diffs -> sell then buy; local cash sim (fast)
        vector<Order> diff_s, diff_b;
        diff_s.reserve(n); diff_b.reserve(n);
        for(int i=0;i<n;i++){
            i64 cur=pos_shares[i], tar=target[i];
            if(cur>tar){
                i64 d=(cur-tar)/L*L;
                if(d>0) diff_s.push_back({false,i,(int)d});
            }
        }
        for(int i=0;i<n;i++){
            i64 cur=pos_shares[i], tar=target[i];
            if(tar>cur){
                i64 d=(tar-cur)/L*L;
                if(d>0) diff_b.push_back({true,i,(int)d});
            }
        }

        i64 sim_cash=cash;
        vector<i64> sim_pos=pos_shares;

        auto try_add = [&](const Order &od){
            if((int)out.size()>=Kmax) return;
            int i=od.idx,q=od.qty;
            i64 p=cl[i];
            if(p<=0) return;
            i64 value=p*(i64)q;
            i64 com=commission(value);
            if(od.buy){
                i64 cost=value+com;
                i64 buf=(i64) llround((long double)cost*1.01L);
                if(sim_cash>=buf){
                    sim_cash-=cost;
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

int main(){
    Trader tr;
    string line;
    if(!IN.getline_str(line)) return 0;

    // INIT n D m L alpha com_min beta K_max
    {
        // avoid stringstream (slow): parse with sscanf
        char tag[16];
        long long m=0;
        if(sscanf(line.c_str(), "%s %d %d %lld %d %lf %lf %lf %d",
                  tag, &tr.n, &tr.D, &m, &tr.L, &tr.alpha, &tr.com_min, &tr.beta, &tr.Kmax) != 9) return 0;
        tr.cash = m*100LL;

        tr.pos_shares.assign(tr.n,0);
        tr.cost_cents.assign(tr.n,0);

        tr.codes.assign(tr.n,"");
        tr.mp.reserve(tr.n*2);

        tr.op.assign(tr.n,0);
        tr.hi.assign(tr.n,0);
        tr.lo.assign(tr.n,0);
        tr.cl.assign(tr.n,0);
        tr.amt.assign(tr.n,0);

        tr.st.assign(tr.n, StockState());
    }

    // day0: build mapping by order
    for(int i=0;i<tr.n;i++){
        if(!IN.getline_str(line)) return 0;
        array<pair<int,int>,12> p;
        int cnt=split12(line,p);
        if(cnt<8) return 0;

        string code(line.begin()+p[1].first, line.begin()+p[1].second);
        tr.codes[i]=code;
        tr.mp[code]=i;

        bool ok;
        tr.op[i]=parse_cents(line,p[2].first,p[2].second,ok); if(!ok) tr.op[i]=0;
        tr.hi[i]=parse_cents(line,p[3].first,p[3].second,ok); if(!ok) tr.hi[i]=0;
        tr.lo[i]=parse_cents(line,p[4].first,p[4].second,ok); if(!ok) tr.lo[i]=0;
        tr.cl[i]=parse_cents(line,p[5].first,p[5].second,ok); if(!ok) tr.cl[i]=0;
        tr.amt[i]=parse_cents(line,p[7].first,p[7].second,ok); if(!ok) tr.amt[i]=0;

        // day0 indicators update
        tr.st[i].have_last = (tr.cl[i]>0);
        tr.st[i].last_close = tr.cl[i];
        if(tr.cl[i]>0) tr.st[i].peak_close = tr.cl[i];
        tr.update_indicators(i);
    }
    tr.day=0;

    while(true){
        vector<Order> orders = tr.build_orders();
        if((int)orders.size()>tr.Kmax) orders.resize(tr.Kmax);

        for(auto &od: orders){
            fast_print_order(od.buy ? "BUY" : "SELL", tr.codes[od.idx], od.qty);
        }
        puts("DONE");
        fflush(stdout);

        tr.pending = orders;

        if(!IN.getline_str(line)) return 0;
        if(line.rfind("FINISH",0)==0) return 0;
        if(line.rfind("INVALID",0)==0 || line.rfind("ERROR",0)==0) return 0;

        // read day t market (first line already read)
        tr.day += 1;
        fill(tr.op.begin(), tr.op.end(), 0);
        fill(tr.hi.begin(), tr.hi.end(), 0);
        fill(tr.lo.begin(), tr.lo.end(), 0);
        fill(tr.cl.begin(), tr.cl.end(), 0);
        fill(tr.amt.begin(), tr.amt.end(), 0);

        if(!tr.parse_line(line)) return 0;
        for(int k=1;k<tr.n;k++){
            if(!IN.getline_str(line)) return 0;
            if(!tr.parse_line(line)) return 0;
        }

        // execute pending at open
        tr.apply_pending_open();

        // update indicators for today (O(n))
        for(int i=0;i<tr.n;i++){
            tr.update_indicators(i);
        }
    }
    return 0;
}
