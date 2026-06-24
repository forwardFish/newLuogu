#include<bits/stdc++.h>
using namespace std;
long long f[1005][1005][3];
long long a[1005][1005];
int main()
{
	long long n,m;
    cin>>n>>m;
    for(int i=1;i<=n;i++)
    {
        for(int j=1;j<=m;j++)
        {
            cin>>a[i][j];
            f[i][j][0]=-0x7fffffff;
            f[i][j][1]=-0x7fffffff;
            f[i][j][2]=-0x7fffffff;

        }
    }
    f[1][1][0]=a[1][1];
    f[1][1][1]=a[1][1];
    f[1][1][2]=a[1][1];
    for(int i=2;i<=n;i++)
    {
        f[i][1][1]=f[i-1][1][1]+a[i][1];
    }
    for(int j=2;j<=m;j++)
    {
        for(int i=1;i<=n;i++)
        {
            f[i][j][0]=max(f[i][j-1][1],max(f[i][j-1][0],f[i][j-1][2]))+a[i][j];
            if(i>=2)
			{
            	f[i][j][1]=max(f[i-1][j][0],f[i-1][j][1])+a[i][j]; 
			}
        }
        for(int i=n-1;i>=1;i--)
        {
            f[i][j][2]=max(f[i+1][j][0],f[i+1][j][2])+a[i][j];
        }
    }
    cout<<max(f[n][m][0],max(f[n][m][1],f[n][m][2]));
    return 0;
}