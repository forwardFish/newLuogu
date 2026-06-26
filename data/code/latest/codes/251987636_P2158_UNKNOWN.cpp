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
	
	int ans=0;
	for(int i=1;i<=n;i++)
	{
		ans+=phi(i);
	}
	cout<<ans;
	return 0;
}