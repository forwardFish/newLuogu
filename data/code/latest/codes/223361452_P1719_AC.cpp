#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=1.2e2+5;
int a[maxn][maxn];
int dp[maxn][maxn]; 
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		for(int j=1;j<=n;j++)
		{
			cin>>a[i][j];
			dp[i][j]=dp[i-1][j]+dp[i][j-1]-dp[i-1][j-1]+a[i][j];
		 } 
	}
	int maxx=-1;
	for(int x1=1;x1<=n;x1++)
	{
		for(int y1=1;y1<=n;y1++)
		{
			for(int x2=1;x2<=n;x2++)
			{
				for(int y2=1;y2<=n;y2++)
				{
					if(x2<x1 || y2<y1) continue;
    				maxx=max(maxx,dp[x2][y2]+dp[x1-1][y1-1]-dp[x2][y1-1]-dp[x1-1][y2]);
				}
			}
		}
	}
	cout<<maxx;
	return 0;
}



