#include<bits/stdc++.h>
//#pragma GCC optimize(2)
#define int long long
using namespace std;
const int maxn=1e3+5;
int dp[maxn][maxn];
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	string s;
	cin>>s;
	 int n=s.size();
	for(int i=1;i<n;i++)
	{
		dp[i][i]=0;
	}
	for(int i=1;i<n-1;i++)
	{
		if(s[i]==s[i-1])
		{
			dp[i-1][i]=0;	
		}
		else
		{
			dp[i-1][i]=1;
		}
	}
	for(int l=2;l<n;l++)
	{
		for(int i=0;i+l<n;i++)
		{
			int j=i+l;
			dp[i][j]=min(dp[i+1][j]+1,dp[i][j-1]+1);
			if(s[i]==s[j])
			{
				dp[i][j]=min(dp[i][j],dp[i+1][j-1]);
			 } 
		}
	}
	cout<<dp[0][n-1];
	return 0;
}

