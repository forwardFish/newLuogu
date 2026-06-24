#include<bits/stdc++.h>
#define int long long
#define endl "\n"
using namespace std;
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	string s;
	cin>>s;
	int b=0,w=0;
	int n=s.size();
	s=' '+s;
	for(int i=1;i<=n;i++)
	{
		if(s[i]=='B') b++;
		else w++;
	}
	if(b==w) cout<<1;
	else cout<<0;
	return 0;
}
