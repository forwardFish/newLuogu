#include<bits/stdc++.h>
using namespace std;
#define int long long
const int N=1e6+5;
int a[N];
int n,m;
bool check(int x)
{
	int sum=0;
	for(int i=0;i<n;i++)
	{
		if(a[i]-x<=0)
		{
			continue;
		}
		else
		{
			sum+=(a[i]-x);
		}
	}
	return sum>=m;
}
int solve()
{
	int l=1,r=N;
	int ans = -1;
	while(l <= r) {
		int mid = l + r >> 1;
		if(check(mid)) 
		{
			ans = mid;
			l = mid + 1;
		}
		else r = mid - 1;
	}
	return ans;
}
signed main()
{
	cin>>n>>m;
	for(int i=0;i<n;i++) cin>>a[i];
	cout<<solve();
	return 0;
}