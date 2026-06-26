#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=1e3+5;
int head[maxn],nex[2*maxn],to[maxn],w[maxn*2],en,dis[maxn];
bool vis[maxn];
void add(int x,int y,int z)
{
	nex[++en]=head[x];
	head[x]=en;
	to[en]=y;
	w[en]=z;
}
struct node
{
	int id,dis;
	bool operator < (const node c) const
	{
		return dis>c.dis;
	 } 
};
priority_queue<node> q;
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
		dis[i]=LLONG_MAX;
	}
	dis[s]=0;
	node a;
	a.id=s;
	a.dis=dis[s];
	q.push(a);
	for(int x=1;x<=n;x++)
	{
		int now=q.top().id;
		q.pop();
		while(vis[now])
		{
			now=q.top().id;
			q.pop();
		}
		vis[now]=true;
		for(int i=head[now];i;i=nex[i])
		{
			dis[to[i]]=min(dis[to[i]],dis[now]+w[i]);
			a.id=to[i];
			a.dis=dis[to[i]];
			q.push(a);
		}
	}
	 for(int i=1;i<=n;i++)
	 {
	 	cout<<dis[i]<<" ";
	 }
	return 0;
}
