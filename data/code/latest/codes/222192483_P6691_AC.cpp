#include<bits/stdc++.h>
#define int long long 
using namespace std;
using lld=long long;
const lld siz=1e6+5;
const lld mod=998244353;
struct node
{
	lld to,w;
};
bool rel = true;
lld n,cot,vis[siz];
lld minn,maxx,si,sam;
vector<node> nods[siz];
void dfs(int now)
{
	si++;
	if(vis[now])
	{
		sam++;
	}	
	for(auto nxt:nods[now])
	{
		lld t=nxt.to,w=nxt.w;
		if(vis[t]==-1)
		{
			vis[t]=vis[now]^w;
			dfs(t);
			if(!rel)
			{
				return;
			}
		}
		else if(vis[t]!=(vis[now]^w))
		{
			rel=false;
			return ;
		}
	}
}
lld da(int t)
{
	lld ret=1;
	for(int i=1;i<=t;i++)
	{
		ret*=2;
		ret%=mod;
	}
	return ret;
}
signed main()
{
	memset(vis,-1,sizeof vis);
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		int p,v;
		cin>>p>>v; 
		nods[i].push_back({p,v^1});
		nods[p].push_back({i,v^1});
	}
	for(int i=1;i<=n;i++)
	{
		if(vis[i]==-1)
		{
			si = sam = 0;
			vis[i] = 0;
			dfs(i);
			if(!rel)
			{
				break;
			}
			cot++;
			minn+=min(sam,si-sam);
			maxx+=max(sam,si-sam);
		}
	}
	if(!rel)
	{
		cout<<"No answer";
	}
	else
	{
		cout<<da(cot)<<endl<<maxx<<endl<<minn;
	}
		
	return 0;
}