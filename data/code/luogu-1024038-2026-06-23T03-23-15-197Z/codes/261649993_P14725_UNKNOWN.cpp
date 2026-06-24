#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=1e5+5;
int a[maxn],d[maxn],f[maxn];
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i];
		d[i]=d[i-1]+a[i];
	}
	for(int i=1;i<=n;i++)
	{
		f[i]=d[i];
		for(int j=1;j<i;j++)
		{
			if(f[j]<=d[i]-d[j])
			{
				f[i]=min(f[i],d[i]-d[j]);
			}
		}
	}
	int ans=f[n];
	for(int i=n-1;i>=0;i--)
	{
		ans=min(ans,max(d[n]-d[i],f[i]));
	}
	cout<<ans;
	return 0;
 }
