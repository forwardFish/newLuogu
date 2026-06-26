#include<bits/stdc++.h>
#define int long long 
using namespace std;
signed main()
{
	int n;
	cin>>n;
	int ans=0;
	for(int i=1;i<=n;i++)
	{
		ans+=__gcd(i,n);
	}
	cout<<ans;
	return 0;
}
