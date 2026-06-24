#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxm=(1<<20)+5;
int dp[maxm],v[maxm];
signed main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	for(int i=1;i<=maxm;i++) dp[i]=1e18;
	int n,m,k;
	cin>>n>>m>>k;
	for(int i=1;i<=n;i++)
	{
		int x=0;
		for(int j=1;j<=k;j++)
		{
			int a;cin>>a;
			x=x|(1<<(a-1));
		}
		dp[x]=1;
		v[i]=x;
	}
	for(int i=0;i<(1<<m);i++)
	{
		for(int j=1;j<=n;j++)
		{
			dp[i|v[j]]=min(dp[i|v[j]],dp[i]+1);
		}
	}
	if(dp[(1<<m)-1]==1e18) cout<<-1;
	else cout<<dp[(1<<m)-1];
	return 0;
 }
