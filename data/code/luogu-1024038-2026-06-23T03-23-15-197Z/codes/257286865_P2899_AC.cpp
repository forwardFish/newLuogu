#include<bits/stdc++.h>
//#pragma GCC optimize(2)
#define int long long
using namespace std;
const int maxn=1e4+5;
vector<int> g[maxn];
int ans;
int dfs(int u,int fa)
{
	int l=g[u].size();
	int x=0;
	for(int i=0;i<l;i++)
	{
		int v=g[u][i];
		if(v!=fa)
		{
			int c=dfs(v,u);
			if(c==0)
			{
				x=2;
			}
			if(c==2 && x!=2)
			{
				x=1;
			}
		}
	}
	if(x==2)
	{
		ans++;
	}
	return x;
}
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int n;
	cin>>n;
	 for(int i=1;i<=n-1;i++)
	 {
	 	int x,y;
	 	cin>>x>>y;
	 	g[x].push_back(y);
	 	g[y].push_back(x);
	 }
	 int pd=dfs(1,0);
	 if(pd==0)
	 {
	 	ans++;
	 }
	 cout<<ans;
	return 0;
}

