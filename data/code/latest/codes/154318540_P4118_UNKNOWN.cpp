#include <bits/stdc++.h>
using namespace std;

#define endl '\n'
#define inf 0x3f3f3f3f
#define m_p(a,b) make_pair(a, b)
#define mem(a,b) memset((a),(b),sizeof(a))
#define io ios::sync_with_stdio(false); cin.tie(0); cout.tie(0)
#define It set<ran>::iterator
typedef long long ll;
typedef pair <ll,ll> pii;

#define MAX 300000 + 50
int n, m;
ll mod;
ll ar[MAX];
int op, l, r;
ll x;
struct ran{
    int l, r;
    mutable ll v;
    bool operator <(const ran &x)const{
        return l < x.l;
    }
};

set<ran>tr;
It split(int pos){
    It it = tr.lower_bound({pos, -1, 0});
    if(it != tr.end() && it->l == pos)return it;
    --it;
    int l = it->l;
    int r = it->r;
    ll v = it->v;
    tr.erase(it);
    tr.insert({l, pos - 1, v});
    return tr.insert({pos, r, v}).first;
}

void emerge_add(int l, int r, ll x = 1){
    It itr = split(r + 1), itl = split(l);
    for(;itl != itr;++itl)itl->v += x;
}

void emerge_bian(int l, int r, ll x = 0){
    It itr = split(r + 1), itl = split(l);
    tr.erase(itl, itr);
    tr.insert({l, r, x});
}

ll get_rank(int l, int r, ll rkn){
    vector<pii>v;
    It itr = split(r + 1), itl = split(l);
    for(;itl != itr;++itl)v.push_back(m_p(itl->v, itl->r - itl->l + 1));
    sort(v.begin(), v.end());
    for(auto [vv, len] : v){
        rkn -= len;
        if(rkn <= 0)return vv;
    }
    return 0;
}

ll q_pow(ll a, ll b, ll mod){
    ll ans = 1;
    a %= mod;
    while(b > 0){
        if(b & 1)ans = ans * a % mod;
        a = a * a % mod;
        b >>= 1;
    }
    return ans;
}

ll get_ans(int l, int r, ll x, ll mod){
    ll ans = 0;
    It itr = split(r + 1), itl = split(l);
    for(;itl != itr;++itl){
        ans = (ans + ((ll)(itl->r - itl->l + 1) * q_pow(itl->v, (ll)x, mod)) % mod) % mod;
    }
    return ans;
}


ll seed, vmax;
ll rnd(){
    ll ret = seed;
    seed = (seed * 7 + 13) % 1000000007;
    return ret;
}

void work(){
    cin >> n >> m >> seed >> vmax;
    for(int i = 1; i <= n; ++i){
//        cin >> ar[i];
        ar[i] = (rnd() % vmax) + 1;
        tr.insert({i, i, ar[i]});
    }
    tr.insert({n+1, n+1, 0});
    for(int i = 1; i <= m; ++i){
//        for(auto [l, r, v] : tr){
//            cout << l << ' ' << r << ' '<< v << endl;
//        }
//        cout << endl << endl;
        op = (int)(rnd() % 4) + 1;
        l = (int)(rnd() % n) + 1;
        r = (int)(rnd() % n) + 1;
        if(l > r)swap(l, r);
        if(op == 3)x = (int)(rnd() % (r - l + 1)) + 1;
        else x = (int)(rnd() % vmax) + 1;
//        cin >> op >> l >> r >> x;
        if(op == 1){
            emerge_add(l, r, x);
        }
        else if(op == 2){
            emerge_bian(l, r, x);
        }
        else if(op == 3){
            cout << get_rank(l, r, x) << endl;
        }
        else {
//            cin >> mod;
            mod = rnd() % vmax + 1;
            cout << get_ans(l, r, x, mod) << endl;
        }
    }
    
}


int main(){
    work();
    return 0;
}

 
