#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=5e3+5;
int a[maxn],t[maxn][maxn];
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i];
	}
	for(int i=1;i<=n;i++)
	{
		for(int j=1;j<=n;j++)
		{
			if(a[j]>=i)
			{
				t[j][i]=t[j][i-1]+1;
			}
			else
			{
				t[j][i]=t[j][i-1]+1;
			}
		}	
	 } 
	int ans=0;
	for(int x=1;x<=n;x++)
	{
		for(int y=1;y<=n;y++)
		{
			if(x<=a[y] && y<=a[x] && min(a[x],a[y])>=1)
			{
				ans+=t[min(a[x],a[y])][max(x,y)];
			}
		}
	}
	cout<<ans;
	return 0;
 }
