#include<bits/stdc++.h>
//#pragma GCC optimize(2)
#define int long long
using namespace std;
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
		b>>=1; 
	}
	return ans; 
}
int phi(int x)
{
	int ans=x;
	for(int i=2;i*i<=x;i++)
	{
		if(x%i==0)
		{
			ans=ans*(i-1)/i;
			while(x%i==0) x/=i; 
		 } 
	}
	if(x>1)
	{
		ans=ans*(x-1)/x;
	}
	return ans;
}
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int a,b=0,m;
	cin>>a>>m;int mod=phi(m);
	string s;
	cin>>s;
	int n=s.size();
	bool pd=0;
	for(int i=0;i<n;i++)
	{
		b=(b*10+(s[i]-'0'));
		if(b>=mod) pd=1;
		b%=mod;	
	}	
	if(!pd)
	{
		b%=mod;
		cout<<qpow(a,b,m);
	}
	else
	{
		b%=mod;
		b+=mod;
		cout<<qpow(a,b,m);
	}
	return 0;
}

