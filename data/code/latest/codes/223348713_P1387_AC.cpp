#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=1e2+5;
int a[maxn][maxn];
int dp[maxn][maxn];
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int n,m;
	cin>>n>>m;
	for(int i=1;i<=n;i++)
	{
		for(int j=1;j<=m;j++)
		{
			cin>>a[i][j];
		}
	}
	int ans=-1;
	for(int i=1;i<=n;i++)
	{
		for(int j=1;j<=m;j++)
		{
			if(a[i][j]==1)
			{
				dp[i][j]=min(min(dp[i][j-1],dp[i-1][j]),dp[i-1][j-1])+1;	
			}
			ans=max(ans,dp[i][j]);
		}
	}
	cout<<ans;
	return 0;
}



