#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=2e2+5;
int a[maxn][maxn];
int dp[maxn];
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int n;
	cin>>n;
	for(int i=1;i<n;i++)
	{
		for(int j=i+1;j<=n;j++)
		{
			cin>>a[i][j];
		}
		dp[i]=INT_MAX;
	}
	for(int i=n-1;i>=1;i--)
	{
		for(int j=i+1;j<=n;j++)
		{
			dp[i]=min(dp[i],dp[j]+a[i][j]);
		}
	}
	cout<<dp[1];
	return 0;
}



