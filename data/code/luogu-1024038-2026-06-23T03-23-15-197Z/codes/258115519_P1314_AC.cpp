#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=2e5+5;
int w[maxn],v[maxn],l[maxn],r[maxn];int n,m,s;
int cnt[maxn],sum[maxn];
int check(int x)
{
	memset(cnt,0,sizeof(cnt));
	memset(sum,0,sizeof(sum));
	for(int i=1;i<=n;i++)
	{
		cnt[i]=cnt[i-1];
		sum[i]=sum[i-1];
		if(w[i]>=x)
		{
			cnt[i]++;
			sum[i]+=v[i];
		}
	}
	int ansx=0;{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}
	for(int i=1;i<=m;i++)
	{
		ansx+=(cnt[r[i]]-cnt[l[i]-1])*(sum[r[i]]-sum[l[i]-1]);
	}
	return ansx;
}
signed main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	cin>>n>>m>>s;
	for(int i=1;i<=n;i++)
	{
		cin>>w[i]>>v[i];
	}
	for(int i=1;i<=m;i++)
	{
		cin>>l[i]>>r[i];
	}
	int l=1,r=LLONG_MAX;
	int ans=LLONG_MAX;
	while(l<=r)
	{
		int mid=(l+r)>>1;
		int a=check(mid);
		ans=min(ans,abs(s-a));
		if(a<s)
		{
			r=mid-1;
		}
		else
		{
			l=mid+1;
		 } 
	}
	cout<<ans;
	return 0;
 }
