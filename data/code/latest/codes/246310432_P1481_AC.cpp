#include<bits/stdc++.h>
using namespace std;
const int maxn=2e3+5;
string s[maxn];
int dp[maxn];
int main()
{
	int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		cin>>s[i];
		dp[i]=1;
	}
	int ans=0;
	for(int i=1;i<=n;i++)
	{
		for(int j=1;j<i;j++)
		{
			if(s[j]==s[i].substr(0,s[j].size()))
			{
				dp[i]=max(dp[j]+1,dp[i]);
			}
		}
		ans=max(ans,dp[i]);
	}
	cout<<ans;
	
	return 0;
}
