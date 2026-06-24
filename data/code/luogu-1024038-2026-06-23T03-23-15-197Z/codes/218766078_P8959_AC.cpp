#include<bits/stdc++.h>
using namespace std;
const int N=2e5+7;
int n,q,rt[N],que[N],indeg[N],a[N],t[N],ans[N];
vector<int> G[N];
vector<pair<int,int>> Q[N];
namespace SGT
{
    int tot;
    struct node{int ls,rs,ans,tag;}tr[N*80];
    #define ls(p) tr[p].ls
    #define rs(p) tr[p].rs
    inline void pushup(int p){tr[p].ans=tr[p].tag+max(tr[ls(p)].ans,tr[rs(p)].ans);}
    void add(int &p,int L,int R,int x,int l=1,int r=q)
    {
        if(!p) p=++tot;
        if(L<=l&&r<=R) return tr[p].ans+=x,tr[p].tag+=x,void();
        int mid=(l+r)>>1;
        if(L<=mid) add(ls(p),L,R,x,l,mid);
        if(R>mid)  add(rs(p),L,R,x,mid+1,r);
        pushup(p);
    }
    void merge(int &p,int q)
    {
        if(!p||!q) return p|=q,void();
        int o=++tot;tr[o]=tr[p],p=o;
        merge(ls(p),ls(q));
        merge(rs(p),rs(q));
        tr[p].tag+=tr[q].tag;
        pushup(p);
    }
    int query(int p,int L,int R,int l=1,int r=q)
    {
        if(!p) return 0;
        if(L<=l&&r<=R) return tr[p].ans;
        int mid=(l+r)>>1,res=0;
        if(L<=mid) res=query(ls(p),L,R,l,mid);
        if(R>mid)  res=max(res,query(rs(p),L,R,mid+1,r));
        return res+tr[p].tag;
    }
}
int main()
{
    ios::sync_with_stdio(0),cin.tie(0);
    int i,x,y,op,qcnt=0,hd,tl,u;
    cin>>n>>q;
    for(i=1;i<=n;++i) cin>>a[i];
    for(i=1;i<n;++i)
    {
        cin>>x>>y;
        G[x].push_back(y),++indeg[y];
    }
    for(i=1;i<=q;++i)
    {
        cin>>op>>x;
        if(op==1) t[x]=i;
        else if(op==2) SGT::add(rt[x],t[x],i-1,a[x]),t[x]=0;
        else Q[x].emplace_back(i,++qcnt);
    }
    for(i=1;i<=n;++i)if(t[i]!=0) SGT::add(rt[i],t[i],q,a[i]);
    //topo
    hd=1,tl=0;
    for(i=1;i<=n;++i)if(indeg[i]==0) que[++tl]=i;
    while(hd<=tl)
    {
        u=que[hd++];
        for(int v:G[u])
        {
            SGT::merge(rt[v],rt[u]);
            if(!--indeg[v]) que[++tl]=v;
        }
        for(auto p:Q[u]) ans[p.second]=SGT::query(rt[u],1,p.first);
    }
    for(i=1;i<=qcnt;++i) cout<<ans[i]<<'\n';
    return 0;
}