#include <bits/stdc++.h>
using namespace std;

struct Order { bool buy; int idx; int qty; };

static inline bool is_sep(char c){ return c==' '||c==','||c=='\t'||c=='\r'||c=='\n'; }

// ---------- fast input ----------
struct FastIn {
    static const int SZ = 1<<20;
    int i=0,n=0; char b[SZ];
    inline char gc(){
        if(i>=n){ n=fread(b,1,SZ,stdin); i=0; if(!n) return 0; }
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

// ---------- money helpers ----------
using i64 = long long;
using i128 = __int128_t;

static inline i64 llround_ld(long double x){
    return (i64) llround(x);
}

static inline void print_i128(i128 x){
    if(x==0){ putchar('0'); return; }
    if(x<0){ putchar('-'); x=-x; }
    char s[80]; int p=0;
    while(x){ int d=(int)(x%10); s[p++]=(char)('0'+d); x/=10; }
    while(p--) putchar(s[p]);
}

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

// ---------- trader ----------
struct Trader {
    int n=200, D=0, L=100, Kmax=0;
    double alpha=0.0, com_min=0.0, beta=0.0;

    // account
    i64 cash=0;                 // cents
    vector<i64> pos_shares;     // shares
    vector<i64> cost_cents;     // rough total cost for current position
    vector<i64> peak_close;     // peak close since entry (for trailing stop)

    // codes
    vector<string> codes;
    unordered_map<string,int> mp;

    // today market
    vector<i64> openp, highp, lowp, closep, amount;

    // histories (keep 120 days enough)
    int hist_keep=130;
    vector<deque<i64>> h_close, h_high, h_low, h_amount;

    vector<Order> pending;
    int day=0;

    // strategy params (tunable)
    int LB_BREAK = 55;   // breakout window
    int LB_MOM   = 60;   // momentum window
    int LB_VOL   = 20;   // vol window (logret std)
    int LB_ATR   = 14;   // ATR window
    int EMA_S    = 20;
    int EMA_L    = 60;

    int rebalance_period = 5; // weekly-ish
    int maxHold = 4;          // concentrated for score

    long long liq_min_yuan = 5000000; // 20d avg amount >= 500万
    double atr_stop_k = 3.0;          // trailing stop: peak - k*ATR
    double ema_stop_k = 1.0;          // also exit if close < EMA20
    long long min_trade_yuan = 5000;  // minimum trade notional (avoid com_min eating)

    // fee in cents
    i64 commission(i64 value_cents) const {
        long double v = (long double)value_cents/100.0L;
        long double c = (long double)alpha * v;
        long double mn= (long double)com_min;
        long double use = (c<mn? mn : c);
        return llround_ld(use*100.0L);
    }
    i64 stamp(i64 value_cents) const {
        long double v = (long double)value_cents/100.0L;
        long double t = (long double)beta * v;
        return llround_ld(t*100.0L);
    }

    // parse one market line
    bool parse_line(const string &line){
        array<pair<int,int>,12> p;
        int cnt=split12(line,p);
        if(cnt<8) return false;

        string code;
        code.assign(line.begin()+p[1].first, line.begin()+p[1].second);
        auto it=mp.find(code);
        if(it==mp.end()) return false;
        int i=it->second;

        bool ok;
        openp[i]=parse_cents(line,p[2].first,p[2].second,ok); if(!ok) openp[i]=0;
        highp[i]=parse_cents(line,p[3].first,p[3].second,ok); if(!ok) highp[i]=0;
        lowp[i] =parse_cents(line,p[4].first,p[4].second,ok); if(!ok) lowp[i]=0;
        closep[i]=parse_cents(line,p[5].first,p[5].second,ok); if(!ok) closep[i]=0;
        amount[i]=parse_cents(line,p[7].first,p[7].second,ok); if(!ok) amount[i]=0;
        return true;
    }

    i64 portfolio_value_close() const {
        i64 v=cash;
        for(int i=0;i<n;i++) if(pos_shares[i]>0 && closep[i]>0) v += pos_shares[i]*closep[i];
        return v;
    }

    i64 avg_amount(int i,int k) const {
        if((int)h_amount[i].size()<k) return 0;
        i64 s=0;
        for(int t=(int)h_amount[i].size()-k;t<(int)h_amount[i].size();t++) s+=h_amount[i][t];
        return s/k;
    }

    // EMA from history (simple iterative on last window)
    double ema(int i,int span) const {
        const auto &hc=h_close[i];
        if(hc.empty()) return 0.0;
        double a = 2.0/(span+1.0);
        // initialize with first element in window
        int start = max(0, (int)hc.size()-span*4); // enough warmup
        double e = (double)hc[start];
        for(int t=start+1;t<(int)hc.size();t++){
            e = a*(double)hc[t] + (1.0-a)*e;
        }
        return e;
    }

    // ATR14 using high/low/prev close (in cents)
    double atr(int i,int k) const {
        const auto &hh=h_high[i];
        const auto &hl=h_low[i];
        const auto &hc=h_close[i];
        int sz=(int)hc.size();
        if(sz<k+1) return 0.0;
        long double s=0;
        for(int t=sz-k;t<sz;t++){
            long double H=hh[t], L=hl[t], PC=hc[t-1];
            long double tr=max(H-L, max(fabsl(H-PC), fabsl(L-PC)));
            s += tr;
        }
        return (double)(s/(long double)k);
    }

    // score: breakout + momentum/vol + liquidity boost
    bool score_stock(int i,double &score,double &atrv){
        score=-1e100; atrv=0;
        const auto &hc=h_close[i];
        if((int)hc.size() < max({LB_BREAK,LB_MOM,LB_VOL,LB_ATR,EMA_L})+2) return false;
        if(closep[i]<=0) return false;

        // liquidity filter
        i64 a20=avg_amount(i,20);
        if(a20 < (i64)liq_min_yuan*100LL) return false;

        // breakout: close >= max(close[-LB_BREAK..-2])  (exclude today close? we already appended today before calling)
        // Here we call after updating histories with today's close, so "today" is back().
        i64 today = hc.back();
        i64 mx=0;
        for(int t=(int)hc.size()-1-LB_BREAK; t< (int)hc.size()-1; t++){
            mx = max(mx, hc[t]);
        }
        bool is_break = (today >= mx);

        // momentum 60d log-return
        long double c0=hc.back();
        long double c1=hc[(int)hc.size()-1-LB_MOM];
        if(c1<=0) return false;
        long double mom = log(c0/c1);

        // vol 20d std of logret
        vector<long double> rs;
        rs.reserve(LB_VOL);
        for(int t=(int)hc.size()-LB_VOL; t<(int)hc.size(); t++){
            long double a=hc[t], b=hc[t-1];
            if(a<=0||b<=0) return false;
            rs.push_back(log(a/b));
        }
        long double mean=0;
        for(auto x:rs) mean+=x;
        mean/= (long double)rs.size();
        long double var=0;
        for(auto x:rs){ long double d=x-mean; var+=d*d; }
        var/= (long double)rs.size();
        long double sd=sqrt(max((long double)0.0,var));

        // trend filter: EMA20 > EMA60
        double e20=ema(i,EMA_S);
        double e60=ema(i,EMA_L);
        bool trend = (e20 > e60);

        atrv = atr(i,LB_ATR);
        if(!(atrv>0)) atrv = 1.0;

        // liquidity boost: log(amount)
        long double liq_boost = log((long double)a20/100.0L + 1.0L);

        // final score
        long double sc = 2.2L*mom - 1.4L*sd + 0.15L*liq_boost + (is_break? 0.6L:0.0L) + (trend? 0.3L: -0.8L);
        score=(double)sc;
        return true;
    }

    // execute pending at today's open
    void apply_pending_open(){
        for(const auto &od: pending){
            int i=od.idx,q=od.qty;
            i64 p=openp[i];
            if(p<=0) continue; // halted
            i64 value=p*(i64)q;
            i64 com=commission(value);

            if(od.buy){
                i64 cost=value+com;
                if(cash>=cost){
                    cash-=cost;
                    cost_cents[i]+=cost;
                    pos_shares[i]+=q;
                    // update peak by today's close later; keep as is here
                }
            }else{
                if(pos_shares[i]>=q){
                    i64 tax=stamp(value);
                    i64 gain=value-tax-com;
                    cash+=gain;

                    // reduce cost proportionally
                    i64 old=pos_shares[i];
                    if(old>0 && cost_cents[i]>0){
                        i64 red=(i64) llround((long double)cost_cents[i]*(long double)q/(long double)old);
                        cost_cents[i]-=red; if(cost_cents[i]<0) cost_cents[i]=0;
                    }
                    pos_shares[i]-=q;
                    if(pos_shares[i]==0){
                        cost_cents[i]=0;
                        peak_close[i]=0;
                    }
                }
            }
        }
        pending.clear();
    }

    // build orders based on last received day data (after histories updated)
    vector<Order> build_orders(){
        vector<Order> out;
        if(day>=D) return out; // after day D, judge will finish after last DONE

        // last day: do nothing (selling costs tax/fees; holding valued at close)
        if(day==D) return out;

        // update trailing peak
        for(int i=0;i<n;i++){
            if(pos_shares[i]>0 && closep[i]>0){
                peak_close[i]=max(peak_close[i], closep[i]);
            }
        }

        // 1) always process exits (trailing stop / ema stop / invalid data)
        vector<Order> sells;
        sells.reserve(n);

        for(int i=0;i<n;i++){
            if(pos_shares[i]<=0) continue;
            if(closep[i]<=0) continue;

            // compute ATR & EMA20
            double atrv = atr(i,LB_ATR);
            if(!(atrv>0)) atrv = 1.0;
            double e20 = ema(i,EMA_S);

            bool exit=false;
            // trailing stop: close < peak - k*ATR
            if(peak_close[i]>0){
                long double thr = (long double)peak_close[i] - (long double)atr_stop_k * (long double)atrv;
                if((long double)closep[i] < thr) exit=true;
            }
            // EMA stop
            if((double)closep[i] < e20 * ema_stop_k) exit=true;

            if(exit){
                int qty=(int)(pos_shares[i]/L)*L;
                if(qty>0) sells.push_back({false,i,qty});
            }
        }

        // non-rebalance day: only exits (reduce churn)
        bool do_reb = (day % rebalance_period == 0);
        if(!do_reb){
            for(auto &od:sells){
                out.push_back(od);
                if((int)out.size()>=Kmax) break;
            }
            return out;
        }

        // 2) select targets (breakout+trend+mom/vol)
        struct Cand{ int i; double sc; double atrv; };
        vector<Cand> cands; cands.reserve(n);

        for(int i=0;i<n;i++){
            double sc, atrv;
            if(score_stock(i, sc, atrv)){
                cands.push_back({i,sc,atrv});
            }
        }
        sort(cands.begin(), cands.end(), [](const Cand&a,const Cand&b){ return a.sc>b.sc; });
        if((int)cands.size()>maxHold) cands.resize(maxHold);

        vector<char> inT(n,0);
        for(auto &c:cands) inT[c.i]=1;

        // 3) target weights: proportional to score (softmax-like) but capped (concentrated)
        vector<long double> w(n,0);
        long double sumw=0;
        for(auto &c:cands){
            long double ww = expl((long double)c.sc); // emphasize strong winners
            if(!isfinite((double)ww) || ww<=0) ww=1;
            w[c.i]=ww;
            sumw+=ww;
        }
        if(sumw<=0) sumw=1;
        for(auto &c:cands){
            w[c.i]/=sumw;
            // cap 40% each (very concentrated)
            if(w[c.i]>0.40L) w[c.i]=0.40L;
        }
        // renorm after cap
        long double s2=0; for(auto &c:cands) s2+=w[c.i];
        if(s2>0) for(auto &c:cands) w[c.i]/=s2;

        // 4) build target shares from portfolio value (use close estimate for next open)
        i64 pv = portfolio_value_close();
        i64 invest = (i64) llround((long double)pv * 0.95L); // keep 5% cash buffer

        vector<i64> target(n,0);
        for(auto &c:cands){
            int i=c.i;
            if(closep[i]<=0) continue;
            long double tv = (long double)invest * w[i];
            i64 sh = (i64)floor(tv / (long double)closep[i]);
            sh = (sh / L) * L;
            // minimum notional
            if(sh>0 && sh*closep[i] < (i64)min_trade_yuan*100LL) sh=0;
            target[i]=sh;
        }
        // force exits override
        for(auto &od:sells) target[od.idx]=0;

        // 5) translate to diff orders: sell then buy
        vector<Order> diff_s, diff_b;
        diff_s.reserve(n); diff_b.reserve(n);

        for(int i=0;i<n;i++){
            i64 cur=pos_shares[i], tar=target[i];
            if(cur>tar){
                i64 d = (cur-tar)/L*L;
                if(d>0) diff_s.push_back({false,i,(int)d});
            }
        }
        for(int i=0;i<n;i++){
            i64 cur=pos_shares[i], tar=target[i];
            if(tar>cur){
                i64 d = (tar-cur)/L*L;
                if(d>0) diff_b.push_back({true,i,(int)d});
            }
        }

        // 6) local cash simulation (use close as conservative est)
        i64 sim_cash=cash;
        vector<i64> sim_pos=pos_shares;

        auto try_add = [&](const Order &od){
            if((int)out.size()>=Kmax) return;
            int i=od.idx,q=od.qty;
            i64 p=closep[i];
            if(p<=0) return;
            i64 value=p*(i64)q;
            i64 com=commission(value);

            if(od.buy){
                i64 cost=value+com;
                // extra 1% buffer
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

        // include sells (exits first to reduce risk), then rebalance sells, then buys
        // (avoid duplicates: we already put exit sells into diff_s by target=0, but keep order stable)
        // Just use diff_s which already covers all sells.
        for(auto &od: diff_s) try_add(od);
        for(auto &od: diff_b) try_add(od);

        return out;
    }
};

int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    Trader tr;

    string line;
    if(!IN.getline_str(line)) return 0;

    // INIT n D m L alpha com_min beta K_max
    {
        stringstream ss(line);
        string tag; long long m=0;
        ss>>tag;
        if(tag!="INIT") return 0;
        ss>>tr.n>>tr.D>>m>>tr.L>>tr.alpha>>tr.com_min>>tr.beta>>tr.Kmax;
        tr.cash = m*100LL;

        tr.pos_shares.assign(tr.n,0);
        tr.cost_cents.assign(tr.n,0);
        tr.peak_close.assign(tr.n,0);

        tr.codes.assign(tr.n,"");
        tr.openp.assign(tr.n,0);
        tr.highp.assign(tr.n,0);
        tr.lowp.assign(tr.n,0);
        tr.closep.assign(tr.n,0);
        tr.amount.assign(tr.n,0);

        tr.h_close.assign(tr.n, {});
        tr.h_high.assign(tr.n, {});
        tr.h_low.assign(tr.n, {});
        tr.h_amount.assign(tr.n, {});

        tr.mp.reserve(tr.n*2);
    }

    // read day0 n lines
    for(int i=0;i<tr.n;i++){
        if(!IN.getline_str(line)) return 0;

        // day0 first time: build mapping by order
        array<pair<int,int>,12> p;
        int cnt=split12(line,p);
        if(cnt<8) return 0;

        string code;
        code.assign(line.begin()+p[1].first, line.begin()+p[1].second);
        tr.codes[i]=code;
        tr.mp[code]=i;

        // parse fields
        bool ok;
        tr.openp[i]=parse_cents(line,p[2].first,p[2].second,ok); if(!ok) tr.openp[i]=0;
        tr.highp[i]=parse_cents(line,p[3].first,p[3].second,ok); if(!ok) tr.highp[i]=0;
        tr.lowp[i] =parse_cents(line,p[4].first,p[4].second,ok); if(!ok) tr.lowp[i]=0;
        tr.closep[i]=parse_cents(line,p[5].first,p[5].second,ok); if(!ok) tr.closep[i]=0;
        tr.amount[i]=parse_cents(line,p[7].first,p[7].second,ok); if(!ok) tr.amount[i]=0;

        if(tr.closep[i]>0) tr.h_close[i].push_back(tr.closep[i]);
        if(tr.highp[i]>0)  tr.h_high[i].push_back(tr.highp[i]);
        if(tr.lowp[i]>0)   tr.h_low[i].push_back(tr.lowp[i]);
        if(tr.amount[i]>0) tr.h_amount[i].push_back(tr.amount[i]);
    }
    tr.day=0;

    while(true){
        // build orders based on last received day
        vector<Order> orders = tr.build_orders();
        if((int)orders.size()>tr.Kmax) orders.resize(tr.Kmax);

        for(auto &od: orders){
            if(od.buy) cout<<"BUY "<<tr.codes[od.idx]<<" "<<od.qty<<"\n";
            else       cout<<"SELL "<<tr.codes[od.idx]<<" "<<od.qty<<"\n";
        }
        cout<<"DONE\n";
        cout.flush();

        tr.pending = orders;

        if(!IN.getline_str(line)) return 0;
        if(line.rfind("FINISH",0)==0) return 0;
        if(line.rfind("INVALID",0)==0 || line.rfind("ERROR",0)==0) return 0;

        // read day t market: first line already in 'line'
        tr.day += 1;
        fill(tr.openp.begin(), tr.openp.end(), 0);
        fill(tr.highp.begin(), tr.highp.end(), 0);
        fill(tr.lowp.begin(), tr.lowp.end(), 0);
        fill(tr.closep.begin(), tr.closep.end(), 0);
        fill(tr.amount.begin(), tr.amount.end(), 0);

        auto read_one = [&](const string &ln)->bool{
            return tr.parse_line(ln);
        };

        if(!read_one(line)) return 0;
        for(int k=1;k<tr.n;k++){
            if(!IN.getline_str(line)) return 0;
            if(!read_one(line)) return 0;
        }

        // execute pending at today's open
        tr.apply_pending_open();

        // update histories
        for(int i=0;i<tr.n;i++){
            if(tr.closep[i]>0){
                tr.h_close[i].push_back(tr.closep[i]);
                if((int)tr.h_close[i].size()>tr.hist_keep) tr.h_close[i].pop_front();
            }
            if(tr.highp[i]>0){
                tr.h_high[i].push_back(tr.highp[i]);
                if((int)tr.h_high[i].size()>tr.hist_keep) tr.h_high[i].pop_front();
            }
            if(tr.lowp[i]>0){
                tr.h_low[i].push_back(tr.lowp[i]);
                if((int)tr.h_low[i].size()>tr.hist_keep) tr.h_low[i].pop_front();
            }
            if(tr.amount[i]>0){
                tr.h_amount[i].push_back(tr.amount[i]);
                if((int)tr.h_amount[i].size()>tr.hist_keep) tr.h_amount[i].pop_front();
            }
        }
    }
    return 0;
}
