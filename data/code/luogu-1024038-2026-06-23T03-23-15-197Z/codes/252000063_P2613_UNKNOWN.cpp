#include<bits/stdc++.h>
#define int long long 
using namespace std;
const int mod=19260817;
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
	int a,b;
	cin>>a>>b;
	int bb=qpow(b,mod-2,mod);
	cout<<bb*a%mod;
	return 0;
}
