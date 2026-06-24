#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=105;
int a[maxn];
int dp1[maxn][maxn],dp2[maxn][maxn];
char c[maxn];
signed main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	int n;
	cin>>n;
	memset(dp1,0x80,sizeof dp1);
	memset(dp2,0x7f,sizeof dp2);
	for(int i=1;i<=n;i++)
	{
		cin>>c[i]>>a[i];
		int x=i+n;
		c[x]=c[i];
		a[x]=a[i];
		dp1[i][i]=a[i];
		dp2[i][i]=a[i];
		dp1[x][x]=a[i];
		dp2[x][x]=a[i];
	}
	int m = 2*n-1;
	for(int l=2;l<=n;l++)
	{
		for(int i=1;i+l-1<=m;i++)
		{
			int j=i+l-1;
			for(int k=i;k<j;k++)
			{
				int x=k+1;
				if(c[x]=='t')
				{
					dp1[i][j]=max(dp1[i][j],dp1[i][k]+dp1[x][j]);
					dp2[i][j]=min(dp2[i][j],dp2[i][k]+dp2[x][j]);
				}
				if(c[x]=='x')
				{
					dp1[i][j]=max(dp1[i][j],max(dp1[i][k]*dp1[x][j],dp2[i][k]*dp2[x][j]));
					dp2[i][j]=min(dp2[i][j],min(dp1[i][k]*dp1[x][j],min(dp2[i][k]*dp2[x][j],min(dp1[i][k]*dp2[x][j],dp2[i][k]*dp1[x][j]))));		
				}
			}
		}
	}
	int maxx=-2147418364;
	for(int i=1;i<=n;i++)
	{
		maxx=max(maxx,dp1[i][i+n-1]);
	}
	cout<<maxx<<endl;
	for(int i=1;i<=n;i++)
	{
		if (dp1[i][i+n-1] == maxn)
		{
			cout<<i<<" ";
		}
	}
	return 0;
}

