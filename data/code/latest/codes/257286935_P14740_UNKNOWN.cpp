#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=1e5+5;
vector<int> g[maxn];
int ans;
int n,k;
struct node
{
	int x,y;
};
node dfs(int u,int fa)
{
	int l=g[u].size();
	int maxx=0,minn=INT_MAX;
	for(int i=0;i<l;i++)
	{
		int v=g[u][i];
		if(v!=fa)
		{
			node a=dfs(v,u);
			maxx=max(maxx,a.x+1);
			minn=min(minn,a.y+1);
		}
	}
	if(maxx==k)
	{
		ans++;
		minn=0;
	 }
	if(maxx+minn<=k)
	{
		maxx=-1;
	 } 
	 return {maxx,minn};
}
signed main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	cin>>n>>k;
	for(int i=1;i<=n-1;i++)
	{
		int u,v;
		cin>>u>>v;
		g[u].push_back(v);
		g[v].push_back(u);
	}
	node aa=dfs(1,0);
	if(aa.x!=-1)
	{
		ans++;
	}
	cout<<ans;	
	return 0;
 }
