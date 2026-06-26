#include<bits/stdc++.h>
using namespace std;
const int maxn=55;
int a[maxn][maxn];
int dp[maxn][maxn][maxn];
int main()
{
	int n,m;
    cin>>n>>m;
	for(int i=1;i<=n;i++)
	{
		for(int j=1;j<=m;j++)
		{
			cin>>a[j][i];
		}
	}
    for(int k=2;k<=2*n;k++)
    {
        for(int i=1;i<=k&&i<=n;i++)
        {
            for(int j=1;j<=k&&j<=n;j++)
            {
                dp[k][i][j]=max(dp[k-1][i-1][j],dp[k][i][j]);
                dp[k][i][j]=max(dp[k-1][i-1][j-1],dp[k][i][j]);
                dp[k][i][j]=max(dp[k-1][i][j],dp[k][i][j]);
                dp[k][i][j]=max(dp[k-1][i][j-1],dp[k][i][j]);
                dp[k][i][j]+=((i==j)?a[k-i][i]:(a[k-i][i]+a[k-j][j]));
            }
        }
    }
    cout<<dp[2*n][n][n];
    return 0;
}