#include<bits/stdc++.h>
//#pragma GCC optimize(2)
#define int long long
using namespace std;
const int maxn=5e5+5;
int fa[maxn]; 

vector<int> g[maxn];
int ans[maxn];
int vis[maxn];
vector<pair<int,int> > q[maxn];
int get(int x)
{
	if(x==fa[x]) return x;
	else return fa[x]=get(fa[x]);
}
void dfs(int u)
{
	fa[u]=u;
	vis[u]=1;
	int n=g[u].size();
	for(int i=0;i<n;i++)
	{
		int v=g[u][i];
		if(!vis[v])
		{
			dfs(v);
			fa[v]=u;
		}
	}
	n=q[u].size();
	for(int i=0;i<n;i++)
	{
		int v=q[u][i].first;
		if(vis[v])
		{
			ans[q[u][i].second]=get(v);
		}
	}
 } 
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int n,m,s;
	cin>>n>>m>>s;
	for(int i=1;i<=n-1;i++)
	{
		int u,v;
		cin>>u>>v;
		g[u].push_back(v);
		g[v].push_back(u);
	 } 
	for(int i=1;i<=m;i++)
	{
		int x,y;
		cin>>x>>y;
		q[x].push_back({y,i});
		q[y].push_back({x,i});
	}
	dfs(s);
	for(int i=1;i<=m;i++)
	{
		cout<<ans[i]<<endl;
	}
	return 0;
}
