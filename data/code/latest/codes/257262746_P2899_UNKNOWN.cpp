#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=1e4+5;
vector<int> g[maxn];
signed main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	int n;
	cin>>n;
	for(int i=1;i<=n-1;i++)
	{
		int u,v;
		cin>>u>>v;
		g[u].push_back(v);
		g[v].push_back(u);
	}
	cout<<ceil(n*1.000/3)+1;
	return 0;
 }
