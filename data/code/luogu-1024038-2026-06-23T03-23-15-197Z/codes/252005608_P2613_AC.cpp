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
	string s1,s2;
	cin>>s1>>s2;
	int a,b;
	int n1=s1.size(),n2=s2.size();
	a=s1[0]-'0';
	for(int i=1;i<n1;i++)
	{
		a=((s1[i]-'0')%mod+a*10%mod)%mod;
	}
	b=s2[0]-'0';
	for(int i=1;i<n2;i++)
	{
		b=((s2[i]-'0')%mod+b*10%mod)%mod;
	}
	int bb=qpow(b,mod-2,mod);
	cout<<bb*a%mod;
	return 0;
}
