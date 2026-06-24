#include<bits/stdc++.h>
using namespace std;
//dengyaotriangle!

int n,m,c;

const int maxn=2e7+10;
struct node{
    int x,y,t;
    node(){}
    node(int x,int y,int t):x(x),y(y),t(t){}
}a[maxn];
int t,q;

bool cmp1(const node&a,const node&b){
    return a.x==b.x?(a.y==b.y?a.t<b.t:a.y<b.y):a.x<b.x;
}
bool cmp2(const node&a,const node&b){
    return a.y==b.y?a.x<b.x:a.y<b.y;
}
vector<int> adj[maxn];
int dfn[maxn],low[maxn],tfa[maxn],c1;

bool gt0;

void tarjan(int u){
    dfn[u]=low[u]=++c1;
    int cch=0;
    for(int i=0;i<(int)adj[u].size();i++){
        int v=adj[u][i];
        if(!dfn[v]){
            tfa[v]=u;
            tarjan(v);
            low[u]=min(low[u],low[v]);
            if(low[v]>=dfn[u]){
                if(tfa[u])gt0=1;
                else cch++;
            }
        }else if(v!=tfa[u])low[u]=min(low[u],dfn[v]);
    }
    if(cch>1)gt0=1;
}
void addprem(int x,int y,int radx,int rady){
    for(int dx=-radx;dx<=radx;dx++){
        for(int dy=-rady;dy<=rady;dy++){
            int cx=x+dx,cy=y+dy;
            if(1<=cx&&cx<=n&&1<=cy&&cy<=m){
                a[++t]=node(cx,cy,0);
            }
        }
    }
}
int main(){
    ios::sync_with_stdio(0);cin.tie(0);
    int t_;
    cin>>t_;
    while(t_--){
        cin>>n>>m>>c;
        t=q=0;
        for(int i=1;i<=c;i++){
            int x,y;cin>>x>>y;
            addprem(x,y,1,1);
            addprem(1,y,0,0);addprem(n,y,0,0);addprem(x,1,0,0);addprem(x,m,0,0);
            a[++t]=node(x,y,-1);
        }
        addprem(1,1,2,2);addprem(1,m,2,2);addprem(n,1,2,2);addprem(n,m,2,2);
        sort(a+1,a+1+t,cmp1);
        int cp=0;node buf(INT_MAX,INT_MAX,1);
        for(int i=1;i<=t;i++){
            if(a[i].x!=buf.x||a[i].y!=buf.y){
                buf=a[i];a[++cp]=buf;
            }
        }
        t=cp;
        for(int i=1;i<=t;i++)if(a[i].t!=-1)a[i].t=++q;
        for(int i=1;i<=q;i++)adj[i].clear(),dfn[i]=0;
        c1=0;
        for(int i=2;i<=t;i++){
            if(a[i].x==a[i-1].x&&a[i].t!=-1&&a[i-1].t!=-1){
                adj[a[i].t].push_back(a[i-1].t);
                adj[a[i-1].t].push_back(a[i].t);
            }
        }
        sort(a+1,a+1+t,cmp2);
        for(int i=2;i<=t;i++){
            if(a[i].y==a[i-1].y&&a[i].t!=-1&&a[i-1].t!=-1){
                adj[a[i].t].push_back(a[i-1].t);
                adj[a[i-1].t].push_back(a[i].t);
            }
        } 
        if(q<=1){
            cout<< -1<<'\n';
            continue;
        }
        if(q==2&&adj[1].size()){
            int id[2];
            for(int i=1;i<=t;i++)if(a[i].t>=1&&a[i].t<=2)id[a[i].t-1]=i;
            if(abs(a[id[0]].x-a[id[1]].x)+abs(a[id[0]].y-a[id[1]].y)==1){
                cout<< -1<<'\n';
                continue;
            }else{
                cout<<1<<'\n';
                continue;
            }
        }
        gt0=0;
        tarjan(1);
        if(c1!=q){
            cout<< 0<<'\n';
        }else cout<<(gt0?1:2)<<'\n';
    }
    return 0;
}