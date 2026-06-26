#include<bits/stdc++.h>
#define int long long
#define endl "\n"
using namespace std;
const int maxn=1e5+5;
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
	int maxx=-1;
	for(int l=1;l<=n;l++)
	{
		set<int> x;
		set<int> y;
		for(int r=l;r<=n;r++)
		{
			if(a[r]%2==1)
			{
				x.insert(a[r]);
			}
			else
			{
				y.insert(a[r]);
			}
			int xs=x.size(),ys=y.size();
			if(xs==ys)
			{
				maxx=max(maxx,xs+ys);
			}
		}
	}
	cout<<maxx;
	return 0;
 }
