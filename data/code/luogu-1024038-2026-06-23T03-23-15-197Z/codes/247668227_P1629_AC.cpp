#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=1e3+5;
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
	for(int i=1;i<=m;i++)
	{
		int u,v,w;
		cin>>u>>v>>w;
		dp[u][v]=min(dp[u][v],w);
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
	int ans=0;
	for(int i=2;i<=n;i++)
	{
		ans+=(dp[i][1]+dp[1][i]);
	}
	cout<<ans;
	return 0;
}
