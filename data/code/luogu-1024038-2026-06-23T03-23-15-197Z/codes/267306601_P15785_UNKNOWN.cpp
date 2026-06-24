#include<bits/stdc++.h>
#define int long long
#define endl "\n"
using namespace std;
signed main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);cout.tie(0);
	int t;
	cin>>t;
	while(t--)
	{
		int l,r;
		cin>>l>>r;
		int d=r-l,x=l;
		int cnt=1;
		while(x>d+2)
		{
			x=(x-d-1)/2;
			cnt++;
		 } 
		 cout<<cnt<<endl; 
	 } 
	return 0;
}
