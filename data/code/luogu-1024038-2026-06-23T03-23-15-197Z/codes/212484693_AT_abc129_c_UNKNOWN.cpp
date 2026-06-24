#include<bits/stdc++.h>
#pragma GCC optimize(2)
using namespace std;
const int maxn=1e5+5;
const int mod=1e9+7;
bool t[maxn];
int dp[maxn];
int main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int n,m;
	cin>>n>>m; 
	for(int i=1;i<=m;i++)
	{
		int a;
		cin>>a;
		t[a]=1;
	}
	dp[0]=1;
	if(t[1]==0) dp[1]=1;
	for(int i=1;i<=n;i++)
	{
		if(t[i]==1) dp[i]=0;
		else dp[i]=(dp[i-1]+dp[i-2])%mod;
	}
	cout<<dp[n];
	return 0;
}


