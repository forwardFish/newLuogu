#include<bits/stdc++.h>
//#pragma GCC optimize(2)
#define int long long
using namespace std;
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int t;
	cin>>t;
	while(t--)
	{
		int n;
		cin>>n;
		int d=5*n*n+2*n+1;
		if(sqrt(d)*sqrt(d)==d)
		{
			cout<<1<<'\n';
		}
		else
		{
			cout<<0<<'\n';
		}
	 } 
	return 0;
}

