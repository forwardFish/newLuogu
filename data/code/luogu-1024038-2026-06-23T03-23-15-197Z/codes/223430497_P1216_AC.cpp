#include<bits/stdc++.h> 
using namespace std;
int n,a[1005][1005],f[1005][1005];
int main()
{
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		for(int j=1;j<=i;j++)
		{
			cin>>a[i][j];
		}
	}
	f[1][1]=a[1][1];
	for(int i=2;i<=n;i++)
	{
		for(int j=1;j<=i;j++)
		{
			f[i][j]=max(f[i-1][j],f[i-1][j-1])+a[i][j];
		}
	}
	int ans=0;
	for(int j=1;j<=n;j++)
	{
		ans=max(ans,f[n][j]);
	}
	cout<<ans<<endl;
	return 0;
}