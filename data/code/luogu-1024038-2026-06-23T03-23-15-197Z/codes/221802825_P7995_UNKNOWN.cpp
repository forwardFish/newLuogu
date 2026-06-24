#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=55;
char c[maxn][maxn];
int f[maxn][maxn][maxn][maxn];
int n,k;
int dfs(int x,int y,int t,int pd)
{
	int ans=0;
	if(t>k || c[x][y]=='H')
	{
		return 0;
	}
	if(f[x][y][t][pd]!=-1)
	{
		return f[x][y][t][pd];
	}
	if(x==n && y==n)
	{
		return 1;
	}
	if(x<n && c[x+1][y]=='.')
	{
		if(pd==0)
		{
			ans+=dfs(x+1,y,t+1,1);
		}
		else
		{
			ans+=dfs(x+1,y,t,1);
		}
	}
	if(y<n && c[x][y+1]=='.')
	{
		if(pd==0)
		{
			ans+=dfs(x,y+1,t,0);
		}
		else
		{
			ans+=dfs(x,y+1,t+1,0);
		}	
	}
	f[x][y][t][pd]=ans;
	return ans;
}
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int t;
	cin>>t;
	while(t--)
	{
		memset(f,-1,sizeof(f));
		cin>>n>>k;
		for(int i=1;i<=n;i++)
		{
			for(int j=1;j<=n;j++)
			{
				cin>>c[i][j];
			}
		}
		cout<<dfs(1,2,0,0)+dfs(1,2,0,1)<<endl;
		
	}
	return 0;
}



