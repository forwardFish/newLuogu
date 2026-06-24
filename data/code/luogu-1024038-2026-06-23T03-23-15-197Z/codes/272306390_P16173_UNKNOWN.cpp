#include<bits/stdc++.h>
#define int long long
#define endl "\n"
using namespace std;
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	int n;
	cin>>n;
	if(n<26)
	{
		cout<<"a";
		cout<<char('a'+n);
		return 0;
	}
	int t=n/25;
	int z=t*25;
	int x=n-z;
	for(int i=1;i<=t+1;i++)
	{
		if(i%2==1) cout<<"a";
		else cout<<"z";
	}
	char c=(char)('a'+26-x-1);
	cout<<c;
	
	return 0;
}
