#include<bits/stdc++.h>
#define int long long
#define endl "\n"
using namespace std;
const int maxw=1e2+5;
const int maxn=1e4+5;
int dp[maxw][maxn] ;
const int mod=1e9+7;
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	int n,w,h;
	cin>>n>>w>>h;
	dp[0][0]=1;
	for(int i=1;i<=w;i++)
	{
		for(int j=0;j<=n;j++)
		{
			if(dp[i-1][j])
			{
				for(int k=0;k<=h;k++)
				{
					if(j+k>n) break;
					dp[i][j+k]=(dp[i][j+k]+dp[i-1][j])%mod;
				}
			}
		}
	}
	int ans=0;
	for(int i=0;i<=n;i++)
	{
		ans=(ans+dp[w][i])%mod;
	}
	cout<<(ans-min(n/w+1,h+1)+mod)%mod;
	return 0;
}
