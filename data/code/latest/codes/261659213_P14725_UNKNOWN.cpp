#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=1e5+5;
int a[maxn],d[maxn],dp[maxn];
vector<pair<int,int>> q;
int ef(int x)
{
	if(q.front().first>x) return -1;
	int l=0,r=q.size()-1;
	while(l<=r)
	{
		int mid=(l+r)>>1;
		if(q[mid].first<=x) l=mid+1;
		else r=mid-1;
	}
	return q[r].second;
}
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
	dp[1]=a[1];
	q.push_back({dp[1]+d[1],1});
	for(int i=2;i<=n;i++)
	{
		int j=ef(d[i]);
		if(j==-1) dp[i]=d[i];
		else dp[i]=d[i]-d[j];
		while(q.back().first>dp[i]+d[i]) q.pop_back();
		q.push_back({dp[i]+d[i],i});
	}
	int ans=dp[n];
	for(int i=n-1;i>=0;i--)
	{
		ans=min(ans,max(d[n]-d[i],dp[i]));
	}
	cout<<ans;
	return 0;
 }
