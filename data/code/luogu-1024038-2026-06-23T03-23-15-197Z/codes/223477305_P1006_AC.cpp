#include<bits/stdc++.h>
using namespace std;
const int maxn=1e2+5;
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
			cin>>a[i][j];
		}
	}
    for(int k=2;k<=n+m;k++)
    {
        for(int i=1;i<=n;i++)
        {
            for(int j=1;j<=n;j++)
            {
				if (k-i>=1 && k-i<=m && k-j>=1 && k-j<=m)
				{
					int w=a[i][k-i];
					if(i!=j) w+=a[j][k-j];
					dp[k][i][j]=max(dp[k-1][i-1][j]+w,dp[k][i][j]);
            	    dp[k][i][j]=max(dp[k-1][i-1][j-1]+w,dp[k][i][j]);
             	   	dp[k][i][j]=max(dp[k-1][i][j]+w,dp[k][i][j]);
            	    dp[k][i][j]=max(dp[k-1][i][j-1]+w,dp[k][i][j]);
				}
                
            }
        }
    }
    
    cout<<dp[n+m][n][n];
    return 0;
}