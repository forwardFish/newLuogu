#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=5e4+5;
int a[maxn];
int t,n;
bool check(int x)
{
	for(int r=x;r<=n;r++)
	{
		int l=r-x+1;
		if(a[r]<=0 && -a[l]<=t)
		{
			return 1;
		}
		if(a[l]>=0 && a[r]<=t)
		{
			return 1;
		}
		if(a[l]<=0&&a[r]>=0 && min(a[r],-a[l])+a[r]-a[l]<=t)
		{
			return 1;
		}	    
	}
	return 0;
}
signed main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	cin>>t>>n;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i];
	}
	sort(a+1,a+n+1);
	int l=0,r=n+1;
	while(l+1<r)
	{
		int mid=(l+r)>>1;
		if(check(mid)) l=mid;
		else r=mid;
	}
	cout<<l;
	return 0;
 } 