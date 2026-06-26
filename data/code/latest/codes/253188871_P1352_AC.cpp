#include<bits/stdc++.h>
using namespace std;
const int maxn=6e3+5;
int r[maxn];
vector<int> g[maxn];
int dp[maxn][2];
int fa[maxn];
void dfs(int x)
{
	dp[x][0]=0;
	dp[x][1]=r[x];
	int n=g[x].size();
	for(int i=0;i<n;i++)
	{
		int a=g[x][i];
		dfs(a);
		dp[x][0]+=max(dp[a][0],dp[a][1]);
		dp[x][1]+=dp[a][0];
	}
}
int main()
{
	int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		cin>>r[i];
	}
	for(int i=1;i<=n-1;i++)
	{
		int u,v;
		cin>>u>>v;
		fa[u]=v;
		g[v].push_back(u);
	}
	int root=1;
	while(fa[root]) root=fa[root];
	dfs(root);
	cout<<max(dp[root][1],dp[root][0]);
	return 0;
}