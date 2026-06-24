#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=1e6+5;
int a[maxn],sum[maxn];
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int n,k;
	cin>>n>>k;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i];
	}
	sort(a+1,a+n+1);
	for(int i=1;i<=n;i++)
	{
		sum[i]=sum[i-1]+a[i];
	}
	
	int maxx=a[n];
	int d=n-k;
	int r=0;
    r=n*(maxx-1)/d+maxx+5;
	int l=0,ans=0;
	while(l<=r)
	{
		int mid=l+(r-l)/2;
		int cnt=upper_bound(a+1,a+n+1,mid)-(a+1);
		__int128 s=cnt*(mid+1)-sum[cnt];
		if(s<=mid*k)
		{
			ans=mid;
			l=mid+1;
		}
		else
		{
			r=mid-1;
		}
	}
	cout<<ans;
	return 0;
	
}






