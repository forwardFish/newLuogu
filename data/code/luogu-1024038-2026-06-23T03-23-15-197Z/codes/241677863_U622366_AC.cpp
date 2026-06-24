#include<bits/stdc++.h>
#define int long long 
using namespace std;
const int maxn=3e6+5;
int a[maxn];
int sum[maxn];
signed main()
{
	int n,m;
	scanf("%lld%lld",&n,&m);
	for(int i=1;i<=n;i++)
	{
		scanf("%lld",&a[i]);
		if(abs(a[i]-a[i-1])<=1)
		{
			sum[i]=sum[i-1]+1;
		}
		else
		{
			sum[i]=sum[i-1];
		}
			
		
	}
	while(m--)
	{
		int l,r;
		scanf("%lld%lld",&l,&r);
		int x=sum[r]-sum[l-1];
		if(abs(a[l]-a[l-1])>1)
		{
			x++;
		}
		if(x==r-l+1)
		{
			printf("YES\n");
		}
		else
		{
			printf("NO\n");
		}
	}
	return 0;
}
