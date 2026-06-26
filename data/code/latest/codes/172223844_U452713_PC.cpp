#include<bits/stdc++.h>
using namespace std;
#define int long long
const int mod=1e9+7;
signed main()
{
	int t;
	cin>>t;
	while(t--)
	{
		int n,m;
		cin>>n>>m;
		if(abs(n-m)>1)
		{
			cout<<0<<endl;
		}
		else 
		{
			if(n==m)
			{
				int ans=1;
				for(int i=1;i<=n;i++)
				{
					ans=ans*i%mod;
				}
				cout<<ans*ans*2%mod<<endl;
			}
			else if(abs(n-m)==1) 
			{
				int ans1=1;
				for(int i=1;i<=n;i++)
				{
					ans1=ans1*i%mod;
				}
				int ans2=1;
				for(int i=1;i<=m;i++) 
				{
					ans2=ans2*i%mod;
				}
				cout<<ans1*ans2%mod<<endl;
			}
		}
	 } 
	return 0;
}