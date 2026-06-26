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
			dp[i][j]=-1;
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
		dp[u][v]=max(dp[u][v],w);
		dp[v][u]=max(dp[v][u],w);
	}
	for(int i=1;i<=n;i++)
	{
		for(int x=1;x<=n;x++)
		{
			for(int y=1;y<=n;y++)
			{
				dp[x][y]=max(dp[x][y],min(dp[x][i],dp[i][y]));
			}
		}
	}
	int t;
	cin>>t;
	while(t--)
	{
		int x,y;
		cin>>x>>y;
		
		cout<<dp[x][y]<<endl;
	}
	return 0;
}
