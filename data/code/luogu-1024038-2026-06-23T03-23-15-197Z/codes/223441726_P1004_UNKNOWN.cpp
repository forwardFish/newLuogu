#include<bits/std++.h>
using namespace std;
const int maxn=30;
int a[maxn][maxn];
int maxn;
int dp[maxn][maxn][maxn];
int main()
{
    cin>>n;
    int y,x,v;
    while(cin>>y>>x>>v)
    {
        if(y==0&&x==0&&v==0)
        {
        	break;
		}
            
        a[y][x]=v;
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