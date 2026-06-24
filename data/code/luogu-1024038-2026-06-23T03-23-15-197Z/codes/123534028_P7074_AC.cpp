#include<bits/stdc++.h>
using namespace std;
#define s long long
#define p -1e17
s f[1005][1005][3];
s a[1005][1005];
int n,m;
s z(s a,s b)
{
    return a>b?a:b;
}
int main()
{
    cin>>n>>m;
    for(int i=1;i<=n;i++)
    {
        for(int j=1;j<=m;j++)
        {
            cin>>a[i][j];
            f[i][j][0]=p;
            f[i][j][1]=p;
            f[i][j][2]=p;

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
            f[i][j][0]=z(f[i][j-1][1],z(f[i][j-1][0],f[i][j-1][2]))+a[i][j];
            if(i>=2) f[i][j][1]=z(f[i-1][j][0],f[i-1][j][1])+a[i][j]; 
        }
        for(int i=n-1;i>=1;i--)
        {
            f[i][j][2]=z(f[i+1][j][0],f[i+1][j][2])+a[i][j];
        }
    }
    cout<<z(f[n][m][0],z(f[n][m][1],f[n][m][2]));
    return 0;
}