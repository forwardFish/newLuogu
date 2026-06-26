#include<bits/stdc++.h>
#define int long long
#define endl "\n"
using namespace std;
const int maxn=5e2+5;
int a[maxn][maxn];
int x1[maxn][maxn],x2[maxn][maxn];
int x_1(int a,int b,int c,int d)
{
	return x1[c][d]-x1[c][b-1]-x1[a-1][d]+x1[a-1][b-1];
}
int x_2(int a,int b,int c,int d)
{
	return x2[c][d]-x2[c][b-1]-x2[a-1][d]+x2[a-1][b-1];
}
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		for(int j=1;j<=n;j++)
		{
			cin>>a[i][j];
			x1[i][j]=x1[i-1][j]+x1[i][j-1]-x1[i-1][j-1]+(a[i][j]==100);
			x2[i][j]=x2[i-1][j]+x2[i][j-1]-x2[i-1][j-1]+(a[i][j]<100);
		}
	}
	int ans=0;
	for(int n1=0;n1<=n;n1++)
	{
		for(int m1=0;m1<=n;m1++)
		{
			if(a[n1][m1]<100) continue;
			int minn=n;
			for(int n2=n1;n2<=n;n2++)
			{
				for(int m2=m1;m2<=minn;m2++)
				{
					if(x_2(n1,m1,n2,m2)>0)
					{
						minn=min(minn,m2);
						break;
					}
					if(x_1(n1,m1,n2,m2)>0)
					{
						ans++;
					}
				}
			}
		}
	}
	cout<<ans;
	return 0;
 }
