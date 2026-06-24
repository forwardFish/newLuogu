#include<bits/stdc++.h>
#define int long long
#define endl "\n"
using namespace std;
const int dx[]={-1,1,2,-2,-1,1,2,-2};
const int dy[]={2,2,1,1,-2,-2,-1,-1};
const int maxn=2e3+5;
int x[maxn],y[maxn],t[maxn][maxn];
int fa[maxn];int n,m,l;
bool vis[maxn][maxn];
int get(int x)
{
	if(fa[x] == x) return x;
	return fa[x]=get(fa[x]);
}
void merge(int x,int y)
{
	fa[get(x)]=get(y);
}
void init()
{
	for(int i=1;i<=n;i++) fa[i]=i;
}
struct node
{
	int u,v,w;
}a[maxn];
bool cmp(node x,node y)
{
	return x.w<y.w;
}
queue<node> q;
void bfs(int sx,int sy)
{
	memset(vis,0,sizeof(vis));vis[sx][sy]=1;
	q.push({sx,sy,1});
	while(!q.empty())
	{
		int x0=q.front().u,y0=q.front().v,w0=q.front().w;q.pop();
		for(int i=0;i<8;i++)
		{
			int nx=x0+dx[i],ny=y0+dy[i];
			if(nx>=1 && nx<=m && ny>=1 && ny<=m && !vis[nx][ny])
			{
				if(t[nx][ny])
				{
					a[++l]={t[sx][sy],t[nx][ny],w0};
				}
				vis[nx][ny]=1;
				q.push({nx,ny,w0+1});
			}
		}
		
	}
}
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	cin>>n>>m;
	for(int i=1;i<=n;i++)
	{
		cin>>x[i]>>y[i];t[x[i]][y[i]]=i;
		fa[i]=i;
	 } 
	 for(int i=1;i<=n;i++) bfs(x[i],y[i]);
	 sort(a+1,a+n+1,cmp);
	 int ans=0;
	 for(int i=1;i<=l;i++)
	{
		int x=get(a[i].u);
		int y=get(a[i].v);
		if(x!=y) 
		{
			ans+=a[i].w;
			fa[x]=y;
		} 
	}
	cout<<ans+n-1;
	return 0;
 }
