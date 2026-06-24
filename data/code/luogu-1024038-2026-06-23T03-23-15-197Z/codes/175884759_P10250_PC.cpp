#include<bits/stdc++.h>
using namespace std;
const int maxn=70;
int dp[maxn];
int main()
{
	int n;
	cin>>n;
	dp[1]=1;
	dp[2]=2;
	dp[3]=4;
	for(int i=4;i<=n;i++)
	{
		dp[i]=dp[i-1]+dp[i-2]+dp[i-3];
	}
	cout<<dp[n];
	return 0;
 } 