#include<bits/stdc++.h>
#define int long long
#pragma GCC optimize(2)
using namespace std;
const int maxn=2e5+5;
int a[maxn],b[maxn];
int dp[maxn][2];
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i];
	}
	for(int i=1;i<=n;i++)
	{
		cin>>b[i];
	}
	int ans1=0,ans2=0,ans3=0,ans4=0;
	for(int i=2;i<=n;i++)
	{
		dp[i][0]=min(abs(a[i]-a[i-1])+dp[i-1][0],abs(a[i]-b[i-1])+dp[i-1][1]);
		dp[i][1]=min(abs(b[i]-a[i-1])+dp[i-1][0],abs(b[i]-b[i-1])+dp[i-1][1]);
	}
	cout<<min(dp[n][0],dp[n][1]);
	return 0;
}



