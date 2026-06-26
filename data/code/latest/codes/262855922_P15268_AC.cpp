#include<bits/stdc++.h>
using namespace std;
const int maxn=2e5+5;
const int maxe=4e5+5;
const int maxh=8e5+5;
int h0[maxn],t0[maxe],nx0[maxe],id0[maxe],dg0[maxn],a2[maxn],b2[maxn],ea2[maxn],eb2[maxn];
char vis[maxn];
int imp[maxn],mp[maxn],su[maxn],sv[maxn],sw[maxn];
int hd[maxn],to[maxh],nx[maxh],eid[maxh],dg[maxn],eu[maxe],ev[maxe];
long long ew[maxe];
char eal[maxe],nal[maxn];
long long hw[maxh];
int hu[maxh];
int hs,ec,ac;
inline void hp_push(long long w,int u)
{
    int i=++hs;hw[i]=w;hu[i]=u;
    while(i>1)
	{
        int p=i>>1;
        if(hw[p]<=hw[i]) break;
        swap(hw[p],hw[i]); 
		swap(hu[p],hu[i]);
        i=p;
    }
}
void hp_pop()
{
    hw[1]=hw[hs];hu[1]=hu[hs];--hs;
    int i=1;
    while(1)
	{
        int l=i<<1,r=l+1,sm=i;
        if(l<=hs&&hw[l]<hw[sm]) sm=l;
        if(r<=hs&&hw[r]<hw[sm]) sm=r;
        if(sm==i)break;
        swap(hw[i],hw[sm]);
		swap(hu[i],hu[sm]);
        i=sm;
    }
}
void add(int a,int b,long long w)
{
    ++ec;
    eu[ec]=a;ev[ec]=b;ew[ec]=w;
    eal[ec]=1;
    ++ac;
    to[ac]=b;eid[ac]=ec;nx[ac]=hd[a];hd[a]=ac;
    ++ac;
    to[ac]=a;eid[ac]=ec;nx[ac]=hd[b];hd[b]=ac;
    dg[a]++;dg[b]++;
}
long long one(int u,int&v,int&ie)
{
    for(int p=hd[u];p;p=nx[p])
	{
        int y=to[p],id=eid[p];
        if(nal[y]&&eal[id])
		{
            v=y;ie=id;return ew[id];
        }
    }
    v=0;ie=0;
    return (long long)4e18;
}
void sup2(int x)
{
    int a=0,b=0,ea=0,eb=0;
    for(int p=hd[x];p;p=nx[p])
	{
        int y=to[p],id=eid[p];
        if(nal[y]&&eal[id])
		{
            if(!a)
			{
				a=y;
				ea=id;
			}
            else
			{
				b=y;
				eb=id;
				break;
			}
        }
    }
    eal[ea]=0;eal[eb]=0;
    dg[a]--;dg[b]--;
    nal[x]=0;dg[x]=0;
    add(a,b,ew[ea]+ew[eb]);
    if(dg[a]==1)
	{
		int vv,ee;
		hp_push(one(a,vv,ee),a);
	}
    if(dg[b]==1)
	{
		int vv,ee;
		hp_push(one(b,vv,ee),b);
	}
}
int main(){
    ios::sync_with_stdio(false);
    cin.tie(0);cout.tie(0);
    int t;cin>>t;
    while(t--)
	{
        int n,m;cin>>n>>m;
        for(int i=1;i<=n;i++)
		{
            h0[i]=0;dg0[i]=0;
            a2[i]=b2[i]=ea2[i]=eb2[i]=0;
            mp[i]=0;
        }

        int ix=0;
        for(int i=0;i<n-1;i++)
		{
            int u,v;cin>>u>>v;
            t0[++ix]=v;id0[ix]=i;nx0[ix]=h0[u];h0[u]=ix;dg0[u]++;
            t0[++ix]=u;id0[ix]=i;nx0[ix]=h0[v];h0[v]=ix;dg0[v]++;
        }
        for(int i=1;i<=n;i++)
		{
			if(dg0[i]==2)
			{
	            int p=h0[i];
	            a2[i]=t0[p];ea2[i]=id0[p];
	            p=nx0[p];
	            b2[i]=t0[p];eb2[i]=id0[p];
	        }
		}
        int k=0;
        for(int i=1;i<=n;i++)
		{
			if(dg0[i]!=2)
			{
	            imp[++k]=i;
	            mp[i]=k;
	        }
		}
        for(int i=0;i<n-1;i++)vis[i]=0;
        int sc=0;
        for(int ii=1;ii<=k;ii++)
		{
            int u0=imp[ii];
            for(int p=h0[u0];p;p=nx0[p])
			{
                int v=t0[p],id=id0[p];
                if(vis[id]) continue;
                vis[id]=1;
                int pr=u0,cu=v,w=1;
                while(dg0[cu]==2)
				{
                    int nn,nid;
                    if(a2[cu]==pr)
					{
						nn=b2[cu];nid=eb2[cu];
					}
                    else
					{
						nn=a2[cu];nid=ea2[cu];
					}
                    vis[nid]=1;
                    pr=cu;cu=nn;w++;
                }
                su[++sc]=u0;sv[sc]=cu;sw[sc]=w;
            }
        }
        for(int i=1;i<=k;i++)
		{
            hd[i]=0;dg[i]=0;nal[i]=1;
        }
        ec=0;ac=0;

        for(int i=1;i<=sc;i++)
		{
            int a=mp[su[i]],b=mp[sv[i]];
            add(a,b,(long long)sw[i]);
        }
        hs=0;
        int lf=0;
        for(int i=1;i<=k;i++)
		{
			if(dg[i]==1)
			{
	            lf++;
	            int vv,ee;
	            hp_push(one(i,vv,ee),i);
	        }
		}

        long long b=(long long)n-m;

        while(b>0 && lf>2 && hs>0)
		{
            long long w=hw[1];
            int u=hu[1];
            hp_pop();
            if(!nal[u]||dg[u]!=1)continue;
            int v,ie;
            long long cw=one(u,v,ie);
            if(cw!=w)
			{
                hp_push(cw,u);
                continue;
            }
            if(cw>b)break;
            b-=cw;
            lf--;
            eal[ie]=0;
            nal[u]=0;
            dg[u]=0;
            dg[v]--;
            if(nal[v])
			{
                if(dg[v]==2) sup2(v);
                else if(dg[v]==1)
				{
                    int vv,ee;
                    hp_push(one(v,vv,ee),v);
                }
            }
        }

        cout<<lf<<"\n";
    }
    return 0;
}
