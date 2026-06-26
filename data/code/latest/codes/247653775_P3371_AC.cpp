#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=1e4+5;
const int maxm=5e5+5;
int head[maxn],nex[maxm],to[maxm],w[maxm],en,dis[maxn];
bool vis[maxn];
void add(int x,int y,int z)
{
	nex[++en]=head[x];
	head[x]=en;
	to[en]=y;
	w[en]=z;
}
signed main()
{
 	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	int n,m,s;
	cin>>n>>m>>s;
	for(int i=1;i<=m;i++)
	{
		int u,v,w;
		cin>>u>>v>>w;
		add(u,v,w);
	}
	for(int i=1;i<=n;i++)
	{
		dis[i]=INT_MAX;
	}
	dis[s]=0;
	for(int x=1;x<=n;x++)
	{
		int now=0;
		for(int i=1;i<=n;i++)
		{
			if(!now && !vis[i])
			{
				now=i;
			}
			if(!vis[i] && (dis[now]>dis[i]) && dis[i]!=2147483647)
			{
				now=i;
			}
		}
		vis[now]=1;
		for(int i=head[now];i;i=nex[i])
		{
			dis[to[i]]=min(dis[to[i]],dis[now]+w[i]);
		}
	 } 
	 for(int i=1;i<=n;i++)
	 {
	 	cout<<dis[i]<<" ";
	 }
	return 0;
}
