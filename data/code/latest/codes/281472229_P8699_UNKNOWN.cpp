#include<bits/stdc++.h>
#define int long long 
#define endl "\n"
using namespace std;
const int mod=123456;

signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	int n,k;cin>>n>>k;
	if(k==1)
	{
		int sum=1;
		for(int i=1;i<=n;i++)
		{
			sum=(sum*i)%mod;
		}
		cout<<(sum%mod);
	}
	return 0;
 } 