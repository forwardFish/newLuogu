#include<bits/stdc++.h>
using namespace std;
const int maxn=70;
int dp[maxn]={0,1,2,4};
int main()
{
	int n;
	cin>>n;
	for(int i=4;i<=n;i++)
	{
		dp[i]=dp[i-1]+dp[i-2]+dp[i-3];
	}
	cout<<dp[n];
	return 0;
 } 