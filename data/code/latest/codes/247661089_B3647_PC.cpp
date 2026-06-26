#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=5e2+5;
int dp[maxn][maxn];
signed main()
{
 	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	int n,m;
	cin>>n>>m;
	for(int i=1;i<=n;i++)
	{
		for(int j=1;j<=n;j++)
		{
			dp[i][j]=INT_MAX;
		}
	}
	for(int i=1;i<=n;i++)
	{
		dp[i][i]=0;
	}
	for(int i=1;i<=n;i++)
	{
		int u,v,w;
		cin>>u>>v>>w;
		dp[u][v]=min(dp[u][v],w);
		dp[v][u]=min(dp[v][u],w);
	}
	for(int i=1;i<=n;i++)
	{
		for(int x=1;x<=n;x++)
		{
			for(int y=1;y<=n;y++)
			{
				dp[x][y]=min(dp[x][y],dp[x][i]+dp[i][y]);
			}
		}
	}
	for(int i=1;i<=n;i++)
	{
		for(int j=1;j<=n;j++)
		{
			cout<<dp[i][j]<<" ";
		}
		cout<<'\n';
	}
	return 0;
}
