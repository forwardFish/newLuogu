#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=55;int n,m;
int a[maxn]; 
bool check(int x)
{
	int ans=0;
	ans+=max(x-m,0ll);
	for(int i=1;i<=n;i++)
	{
		ans+=max(x-a[i],0ll);
	}
	return ans<=x;
}
signed main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	cin>>n>>m;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i];
	}
	int l=0,r=INT_MAX;
	while(l<r)
	{
		int mid=(l+r+1)>>1;
		if(check(mid)) l=mid;
		else r=mid-1;
	}
	cout<<l;
	return 0;
 } 