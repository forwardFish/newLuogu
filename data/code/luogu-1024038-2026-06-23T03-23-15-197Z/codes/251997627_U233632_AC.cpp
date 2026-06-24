#include<bits/stdc++.h>
#define int long long 
using namespace std;
const int mod=998244353;
int qpow(int a,int b,int m)
{
	int base=a,ans=1;
	while(b)
	{
		if(b & 1)
		{
			ans=ans*base%m;
		}
		base=base*base%m;
		b/=2;
	}
	return ans%m;
}
signed main()
{
	int n,m;
	cin>>n>>m;
	int ans1=1,ans2=1,ans3=1;
	for(int i=1;i<=n;i++)
	{
		ans1=ans1*i%mod;
	}
	for(int i=1;i<=m;i++)
	{
		ans2=ans2*i%mod;
	}
	for(int i=1;i<=(n-m);i++)
	{
		ans3=ans3*i%mod;
	}
	int ans4=ans2*ans3%mod;
	int b=qpow(ans4,mod-2,mod);
	cout<<ans1*b%mod;
	return 0;
}
