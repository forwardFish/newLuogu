#include<bits/stdc++.h>
#define int long long
#define endl "\n"
using namespace std;
const int maxn=505;
const int mod=123456;
int dp[maxn][maxn];
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
 	int n,k;
 	cin>>n>>k;
 	dp[1][0]=1;
 	for(int i=2;i<n;i++)
 	{
 		dp[i][0]=2;
 		for(int j=0;j<=i;j++)
 		{
 			dp[i+1][j]+=dp[i][j]*(j+1)%mod;
 			dp[i+1][j+1]+=dp[i][j]*2%mod;
 			dp[i+1][j+2]+=dp[i][j]*(i-j-3)%mod;
		 }
	 }
	 cout<<dp[n][k-1]%mod;
	return 0;
 }
