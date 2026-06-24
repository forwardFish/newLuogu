#include<bits/stdc++.h>
using namespace std;
int phi(int x)
{
	int ans=x;
	for(int i=2;i*i<=x;i++)
	{
		if(x%i==0)
		{
			ans-=ans/i;
			while(x%i==0) x/=i;
		}
	}
	if(x>1)
	{
		ans-=ans/x;
	}
	return ans;
}
int main()
{
	int n;
	cin>>n;
	if(n==1)
	{
		cout<<0;
		return 0;
	}
	int ans=0;
	for(int i=2;i<=n-1;i++)
	{
		ans+=phi(i);
	}
	cout<<ans*2+3;
	return 0;
}