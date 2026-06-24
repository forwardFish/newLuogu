#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=1e5+5;
const int N=1e8; 
int a[maxn],n;
bool check(int x)
{
	for(int i=1;i<=n;i++)
	{
		x+=a[i];
		if(x<=0)
		{
			return false;
		}
	}
	return true;
}
int solve()
{
	int l=1;
	int r=N;
	int ans = 0;
	while(l <= r) {
		int mid = (l+r)/2;
		if(check(mid)) 
		{
			ans = mid;
			r = mid - 1;	
		}
		else l = mid + 1;
	}
	return ans;
}
signed main()
{
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i];
	}
	cout<<solve();
	return 0; 
}