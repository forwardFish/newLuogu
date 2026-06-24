#include<bits/stdc++.h>
using namespace std;
#define int long long
const int mod=1e9+7;
int sum[100000];
signed main()
{
	int t;
	cin>>t;
	sum[1]=1;
	for(int i=2;i<=100000;i++)
	{
		sum[i]=sum[i-1]*i%mod;
	}
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
				cout<<sum[n]*sum[m]*2%mod<<endl;
			}
			else if(abs(n-m)==1) 
			{
				cout<<sum[n]*sum[m]*2%mod<<endl;
			}
		}
	 } 
	return 0;
}