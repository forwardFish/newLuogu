#include<bits/stdc++.h>
using namespace std;
const int maxn=5e3+5;
int n,m,a[maxn+5][maxn+5];
int main()
{
	cin>>n>>m;
	for (int i=1;i<=n;i++)
	{
		int x,y,v;
		cin>>x>>y>>v;
		a[x+1][y+1]+=v;
	}
	for (int i=1;i<=maxn;i++)
	{
		for (int j=1;j<=maxn;j++)
		{
			a[i][j]=a[i-1][j]+a[i][j-1]-a[i-1][j-1]+a[i][j];
		}	
	}
	int ans=0;
	for (int i=m;i<=maxn;i++)
	{
		for (int j=m;j<=maxn;j++)
		{
			ans=max(ans,a[i][j]-a[i-m][j]-a[i][j-m]+a[i-m][j-m]);
		}
	}
	cout<<ans<<endl;
	return 0;
}