#include<bits/stdc++.h>
#define int long long
#define endl "\n"
using namespace std;
const int dx[]={0,0,0,-1,1};
const int dy[]={0,-1,1,0,0};
const int maxn=3e3+5;
int vis[maxn][maxn];
int ans;
void dfs(int x,int y)
{
	for(int i=0;i<=4;i++)
	{
		int xx=x+dx[i];
		int yy=y+dy[i];
		if(vis[xx-1][yy]+vis[xx+1][yy]+vis[xx][yy-1]+vis[xx][yy+1]==3 && vis[xx][yy]==1)
		{
			if(!vis[xx-1][yy]) xx--;
			else if(!vis[xx+1][yy]) xx++;
			else if(!vis[xx][yy-1]) yy--;
			else yy++;
			ans++;
			vis[xx][yy]=1;
			dfs(xx,yy);
		}
	}
}
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		int x,y;
		cin>>x>>y;
		x+=1000,y+=1000;
		if(vis[x][y]) ans--;
		else 
		{
			vis[x][y]=1;
			dfs(x,y);
		}
		cout<<ans<<endl;
	}
	return 0;
 }
