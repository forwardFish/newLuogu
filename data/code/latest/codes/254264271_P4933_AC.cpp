#include<bits/stdc++.h>
//#pragma GCC optimize(2)
#define int long long
using namespace std;
const int maxn=1e3+5;
const int maxv=2e4+5;
const int mod=998244353;
int dp[maxn][maxv*2];
int a[maxn];
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
	 int ans=0;
	 for(int i=1;i<=n;i++)
	 {
	 	for(int j=1;j<i;j++)
	 	{
	 		dp[i][a[i]-a[j]+maxv]=(dp[i][a[i]-a[j]+maxv]+dp[j][a[i]-a[j]+maxv]+1)%mod;;
	 		ans=(ans+dp[j][a[i]-a[j]+maxv]+1)%mod;
		 }
	 }
	 cout<<(ans+n)%mod;
	return 0;
}

