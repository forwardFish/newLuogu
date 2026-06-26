#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=6e3+5;
int a[maxn];
int dp[maxn][2];
vector<int> g[maxn];
void dfs(int u,int fa)
{
	dp[u][0]=0;
	dp[u][1]=1;
	int n=g[u].size();
	for(int i=0;i<n;i++)
	{
		int v=g[u][i];
		if(v!=fa)
		{
			dfs(v,u);
			dp[u][0]+=max(dp[v][0],dp[v][1]);
			dp[u][1]+=dp[v][0];
		}
	}
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
	 dfs(1,0);
	 cout<<max(dp[1][0],dp[1][1]); 
	return 0;
}

