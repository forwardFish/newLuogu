#include<cstdio>
#include<cstring>
#include<algorithm>
using namespace std;
const int N=30;
int a[N][N];
int n;
int dp[N][N][N];
int main()
{
    scanf("%d",&n);
    int y,x,v;
    while(scanf("%d%d%d",&y,&x,&v)!=EOF)
    {
        if(!y&&!x&&!v)
            break;
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
    printf("%d\n",dp[2*n][n][n]);
    return 0;
}