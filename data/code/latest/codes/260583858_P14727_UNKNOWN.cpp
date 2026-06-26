#include<bits/stdc++.h>
#define int long long  
using namespace std;
const int maxn=1e5+5;
int sum[maxn];
signed main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	int n,k;
	cin>>n>>k;
	int s=0;
	for(int i=1;i<=n;i++)
	{
		int l,r;cin>>l>>r;
		if(l<=s) sum[i]=sum[i-1];
		else sum[i]=sum[i-1]+l-s;
		s=max(s,r);
	}
	s=1;
	int ans=0;
	for(int i=1;i<=k;i++)
	{
		int t;cin>>t;
		ans+=abs(sum[t]-sum[s]);
		s=t;
	}
	cout<<ans;
	return 0;
}
