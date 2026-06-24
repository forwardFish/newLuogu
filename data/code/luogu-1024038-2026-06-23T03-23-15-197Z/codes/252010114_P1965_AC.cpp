#include<bits/stdc++.h>
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
		b/=2;
	}
	return ans%m;
}
int main()
{
	int n,m,k,x;
	cin>>n>>m>>k>>x;
	cout<<(x+qpow(10,k,n)*m%n)%n;
	return 0;
}
