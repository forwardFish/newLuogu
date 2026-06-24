#include<bits/stdc++.h>
//#pragma GCC optimize(2)
#define int long long
using namespace std;
const int maxn=5e5+5;
vector<int> g[maxn];
int dp[maxn][20];
int d[maxn];
void dfs(int u,int fa)
{
	int n=g[u].size();
	for(int i=0;i<n;i++)
	{
		int v=g[u][i];
		if(v!=fa)
		{
			d[v]=d[u]+1;
			dp[v][0]=u;
			dfs(v,u);
		}
	}
 } 
 int lca(int x,int y)
 {
 	if(d[x]<d[y]) swap(x,y);
 	for(int i=18;i>=0;i--)
 	{
 		if(d[dp[x][i]]>=d[y])
 		{
 			x=dp[x][i];
		 }
	 }
	 if(x==y)
	 {
	 	return x;
	 }
	 for(int i=18;i>=0;i--)
	 {
	 	if(dp[x][i]!=dp[y][i])
	 	{
	 		x=dp[x][i];
	 		y=dp[y][i];
		 }
	 }
	 return dp[x][0];
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
	 d[s]=1;
	 dfs(s,0);
	 for(int j=1;j<=18;j++)
	 {
	 	for(int i=1;i<=n;i++)
	 	{
	 		dp[i][j]=dp[dp[i][j-1]][j-1];
		 }
	 }
	 while(m--)
	 {
	 	int x,y;
	 	cin>>x>>y;
	 	cout<<lca(x,y)<<endl;
	 }
	return 0;
}

