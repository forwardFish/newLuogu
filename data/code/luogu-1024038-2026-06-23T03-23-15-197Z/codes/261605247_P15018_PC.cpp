#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=5e3+5;
int a[maxn];
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i];
	}
	int ans=0;
	for(int x=1;x<=n;x++)
	{
		for(int y=1;y<=n;y++)
		{
			if(x<=a[y] && y<=a[x])
			{
				for(int z=1;z<=min(a[x],a[y]);z++)
				{
					if(a[z]>=max(x,y)) ans++;
				}
			}
		}
	}
	cout<<ans;
	return 0;
 }
