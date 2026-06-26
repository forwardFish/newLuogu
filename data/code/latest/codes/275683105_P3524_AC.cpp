#include<bits/stdc++.h>
using namespace std;
#define int long long
#define endl "\n"
const int maxn=3e3+5;
bool g[maxn][maxn],vis[maxn];
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	int n,m;
	cin>>n>>m;
	for(int i=1;i<=m;i++)
	{
		int a,b;
		cin>>a>>b;
		g[a][b]=g[b][a]=1;
	}
	for(int i=1;i<=n;i++)
	{
		if(vis[i]) continue;
		for(int j=i+1;j<=n;j++)
		{
			if(!g[i][j] && !vis[j])
			{
				vis[i]=vis[j]=1;
				break;
			}
				
			
		}
	}
	int cnt=0;
	for(int i=1;i<=n;i++)
	{
		if(!vis[i])
		{
			cout<<i<<" ";
			cnt++;
			if(cnt*3==n)
			{
				return 0;
			}
		}
		
	}
	return 0;
}
