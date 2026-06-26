#include<bits/stdc++.h>
using namespace std;
#define int long long
#define endl "\n"
const int maxn=5e5+5;
vector<int> g[maxn];
int ans[maxn],l;
bool vis[maxn];
void dfs(int x,int s)
{
	vis[x]=1;
	if(s>=2) return;
	int si=g[x].size();
	for(int i=0;i<si;i++)
	{
		dfs(g[x][i],s+1);
	}
}
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	int n,m,k;
	cin>>n>>m>>k;
	for(int i=1;i<=m;i++)
	{
		int x,y;
		cin>>x>>y;
		g[x].push_back(y);
		g[y].push_back(x);
	}
	for(int i=1;i<=n;i++)
	{
		if(!vis[i])
		{
			ans[++l]=i;
			dfs(i,0);
		}
	}
	cout<<l<<endl;;
	for(int i=1;i<=l;i++)
	{
		cout<<ans[i]<<" ";
	}
	return 0;
}
