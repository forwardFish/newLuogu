#include<bits/stdc++.h>
//#pragma GCC optimize(2)
#define int long long
using namespace std;

const int maxn=3e2+5;
int n,m;
int dp[maxn][maxn];
vector<int> g[maxn];
void dfs(int x)
{
	int n=g[x].size();
	for(int i=0;i<n;i++)
	{
		dfs(g[x][i]);
	 } 
	for(int i=0;i<n;i++)
	{
		for(int j=m;j>0;j--)
		{
			for(int k=0;k<j;k++)
			{
				dp[x][j]=max(dp[x][j],dp[x][j-k]+dp[g[x][i]][k]);
			}
		}
	}
}
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	
	cin>>n>>m;m++;
	for(int i=1;i<=n;i++)
	{
		int x;
		cin>>x>>dp[i][1];
		g[x].push_back(i);
	}
	dfs(0);
	cout<<dp[0][m];
	return 0;
}

