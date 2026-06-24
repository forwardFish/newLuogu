#include<bits/stdc++.h>
using namespace std;
const int mod=998244353;
int main()
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
	cout<<ans1/ans4;
	return 0;
}
