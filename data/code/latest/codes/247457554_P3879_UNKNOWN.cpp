#include<bits/stdc++.h>
#pragma GCC optimize(2)
#define int long long
using namespace std;
map<string,vector<int> > t;
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		int l;
		cin>>l;
		for(int j=1;j<=l;j++)
		{
			string s;
			cin>>s;
			t[s].push_back(i);
		}
	}
	int q;
	cin>>q;
	while(q--)
	{
		string s;
		cin>>s;
		for(auto it:t[s])
		{
			cout<<it<<" ";
		}
		cout<<'\n';
	 } 
	return 0;
}

