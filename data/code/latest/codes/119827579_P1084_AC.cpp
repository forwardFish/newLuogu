#include<cstdio>
#include<cctype>
#include<cstring>
#include<algorithm>
using namespace std;
#define N 50005
#define reg register
#define ll long long
int n,m,head[N],cnt,p[N],dep[N],f[N][17],cnta,cntb;
ll g[N][17];
bool vis[N];
struct nd{
    ll num;
    int d;
    bool operator <(const nd& rhs)const{return num<rhs.num;}
}a[N],b[N];
struct edge{
    int to,dis,nxt;
}e[N<<1];
inline int readint(){
    reg char c=getchar();
    for(;!isdigit(c);c=getchar());
    reg int d=0;
    for(;isdigit(c);c=getchar())
    d=(d<<3)+(d<<1)+(c^'0');
    return d;
}
void Dfs(int now){//预处理
    for(reg int i=head[now];i;i=e[i].nxt)
    if(!dep[e[i].to]){
        dep[e[i].to]=dep[now]+1;
        f[e[i].to][0]=now;
        g[e[i].to][0]=e[i].dis;
        Dfs(e[i].to);
    }
}
void feng(int now){
    if(vis[now])return;
    vis[now]=true;
    reg bool lt=true;
    for(reg int i=head[now];i;i=e[i].nxt)
    if(dep[now]<dep[e[i].to]){
        lt=false;
        feng(e[i].to);
        vis[now]&=vis[e[i].to];
    }
    if(lt)vis[now]=false;
}
bool ok(ll k){//判断
    reg int x;
    reg ll sum;
    cnta=cntb=0;
    memset(vis,0,sizeof vis);
    memset(a,0,sizeof a);
    memset(b,0,sizeof b);
    for(reg int i=1;i<=m;++i){
        x=p[i],sum=0;
        for(reg int j=16;j>-1;--j)//让军队爬上来
        if(f[x][j]>1&&sum+g[x][j]<=k)
        sum+=g[x][j],x=f[x][j];
        if(f[x][0]==1&&sum+g[x][0]<=k){
            a[++cnta]=(nd){k-sum-g[x][0],x};
        }else vis[x]=true;
    }
    feng(1);//搜索已经被封的节点
    if(vis[1])return true;
    for(reg int i=head[1];i;i=e[i].nxt)
    if(!vis[e[i].to])b[++cntb]=(nd){e[i].dis,e[i].to};
    if(cnta<cntb)return false;
    reg int zz2=1;
    sort(a+1,a+cnta+1);
    sort(b+1,b+cntb+1);
    for(reg int i=1;i<=cnta&&zz2<=cntb;++i){//判断答案
        if(!vis[a[i].d])vis[a[i].d]=true;else{
            while(vis[b[zz2].d]&&zz2<=cntb)++zz2;
            if(zz2>cntb)return true;
            if(a[i].num>=b[zz2].num)vis[b[zz2++].d]=true;
        }
        while(vis[b[zz2].d]&&zz2<=cntb)++zz2;
    }
    return zz2>cntb;
}
int main(){
    reg ll ans=-1,l=0,r=0;
    cnt=0;
    memset(head,0,sizeof head);
    memset(dep,0,sizeof dep);
    memset(f,0,sizeof f);
    memset(g,0,sizeof g);
    n=readint();
    for(reg int i=1;i<n;++i){
        reg int u=readint(),v=readint(),t=readint();
        r+=t;
        e[++cnt]=(edge){v,t,head[u]};
        head[u]=cnt;
        e[++cnt]=(edge){u,t,head[v]};
        head[v]=cnt;
    }
    m=readint();
    for(reg int i=1;i<=m;++i)p[i]=readint();
    dep[1]=1;
    Dfs(1);
    for(reg int j=1;j<17;++j)//预处理++
    for(reg int i=1;i<=n;++i){
        f[i][j]=f[f[i][j-1]][j-1];
        g[i][j]=g[f[i][j-1]][j-1]+g[i][j-1];
    }
    while(l<=r){//二分
        reg ll mid=(l+r)>>1;
        if(ok(mid))r=(ans=mid)-1;else
        l=mid+1;
    }
    printf("%lld\n",ans);
    return 0;
}