#include<bits/stdc++.h>
using namespace std;
const int maxn=1.5e3+5;
vector<int> g[maxn];
int dp[maxn][2];
int fa[maxn];
void dfs(int x,int f)
{
	dp[x][0]=0;
	dp[x][1]=1;
	int n=g[x].size();
	for(int i=0;i<n;i++)
	{
		int u=g[x][i];
		if(u!=f)
		{
			dfs(u,x);
			dp[x][0]+=dp[u][1];
			dp[x][1]+=min(dp[u][0],dp[u][1]);
		}
		
	}
}
int main()
{
	int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		int u,v,k;
		cin>>u>>k;
		for(int j=1;j<=k;j++)
		{
			cin>>v;
			g[u].push_back(v);
			g[v].push_back(u);
		}
	}
	dfs(0,0);
	cout<<min(dp[0][1],dp[0][0]);
	return 0;
}
