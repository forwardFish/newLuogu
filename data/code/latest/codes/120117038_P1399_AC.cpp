#include<bits/stdc++.h>
using namespace std;
#define debug(a) cout << #a": " << a << endl;
#define rep(i, ll,rr) for(int i = ll; i <= rr; ++i)
const int N =1e5+10,INF = 1e9;
typedef pair<int,int> pii;
#define x first
#define y second
typedef long long LL; typedef unsigned long long ULL; typedef long double LD;
inline LL read() { LL s = 0, w = 1; char ch = getchar(); for (; !isdigit(ch); ch = getchar()) if (ch == '-') w = -1; for (; isdigit(ch); ch = getchar())    s = (s << 1) + (s << 3) + (ch ^ 48); return s * w; }
inline void print(LL x, int op = 10) { if (!x) { putchar('0'); if (op)  putchar(op); return; }  char F[40]; LL tmp = x > 0 ? x : -x; if (x < 0)putchar('-');  int cnt = 0;    while (tmp > 0) { F[cnt++] = tmp % 10 + '0';     tmp /= 10; }    while (cnt > 0)putchar(F[--cnt]);    if (op) putchar(op); }
int n,m,a,b;
LL e[N*2],ne[N*2],h[N],idx=0,fu[N*2],tr[N*2],brk;
LL w[N*2],fw[N],d[N*2],s[N*2],sum[N*2],c;
LL A[N],B[N],C[N],D[N],sub[N],mn=-0x3f3f3f3f;
int cir[N],ed=0,q[N*2];
bool st[N*2],ins[N*2];
LL res,ans=1e18;
void add(int a,int b,LL c){
    e[idx]=b,w[idx]=c,ne[idx]=h[a],h[a]=idx++;
}

void dfs_s(int u,int fa){
    st[u] = ins[u] = true;
    for(int i=h[u];~i;i=ne[i]){
        int j = e[i];
        if(j==fa) continue;
        fu[j] = u,fw[j] = w[i];

        if(!st[j]) dfs_s(j,u);
        else if(ins[j]){
           brk = w[i];
           LL sum = 0;
           for(int k = u;k!=j;k=fu[k]){
               s[k] = sum;
               sum += fw[k];
               cir[++ed] = k;

           }
           s[j] = sum, cir[++ed] = j;
        }
    }
    ins[u] = false;
}
LL dfs_d(int u,int id){
    st[u] = true;
    LL d1 = 0 , d2 = 0 ;
    for(int i=h[u];~i;i=ne[i]){
        int j = e[i];
        if(st[j]) continue;
        LL length = dfs_d(j,id)+w[i];
        if(length > d1) d2 = d1,d1 = length;
        else if(length > d2) d2 = length;
    }
    tr[id] = d1 + d2;
    return d1;
}
signed main(){
    memset(h,-1,sizeof h);
    n=read();
    rep(i,1,n){
        a=read(),b=read(),c=read();
        add(a,b,c),add(b,a,c);
    }
    for(int i=1;i<=n;i++)
        if(!st[i])
            dfs_s(i,-1);
    memset(st,0,sizeof st);
    for(int i=1;i<=ed;i++) st[cir[i]] = true; 
    int sz = 1;
    for(int j = 1;j <= ed; j++){
        int k = cir[j];
        d[sz] = dfs_d(k,sz);
        sum[sz] = s[k];
        sz ++ ;
    }sz--;
    for(int j=1;j<=sz-1;j++){
        sub[j] = sum[sz] - sum[j];
        if(j==1) A[j] = d[j];
        else A[j] = max(A[j-1] , d[j] + sum[j]);
    }
    for(int j=sz-1;j>=1;j--){
        if(j==sz-1) B[j] = d[j+1];
        else B[j] = max(B[j+1],d[j+1] + sub[j+1]);
    }
    mn=-0x3f3f3f3f;
    for(int j=1;j<=sz-1;j++){
        if(j==1) C[j] = max(d[j],tr[j]);
        else C[j] = max({C[j-1],tr[j],d[j]+sum[j]+mn});
        mn = max(mn,d[j]-sum[j]);
    }
    mn=-0x3f3f3f3f;
    for(int j=sz-1;j>=1;j--){
        if(j==sz-1) D[j] = max(tr[j+1],d[j+1]);
        else D[j] = max({D[j+1],tr[j+1],d[j+1]+sub[j+1]+mn});
        mn = max(mn,d[j+1]-sub[j+1]);
    }
    for(int i=1;i<=sz-1;i++){
        ans=min(ans,max({A[i],B[i],C[i],D[i],A[i]+B[i]+brk}));
    }

    ans & 1 ? printf("%lld.5",ans/2) : printf("%lld.0",ans/2);
    return 0;
}