#include<bits/stdc++.h>
using namespace std;
//注释为启发式合并（从小到大） 
const int maxn=1e4+5;
int fa[maxn];
int siz[maxn];
int get(int x)
{
	if(fa[x] == x) return x;
	return fa[x]=get(fa[x]);
}
void merge(int x,int y)
{
	int fx=get(x),fy=get(y);
//	if(siz[fy] < siz[fx]) swap(fx,fy);
	if(fx!=fy) 
	{
//		siz[fy]+=siz[fx];
		fa[fx]=fy;
	}
}
int main()
{
	int n,m,p;
	cin>>n>>m>>p;
	for(int i=1;i<=n;i++) fa[i]=i,siz[i]=1;
	for(int i=1;i<=m;i++)
	{
		int x,y;
		cin>>x>>y;
		merge(x,y);
	}
	for(int i=1;i<=p;i++)
	{
		int u,v;cin>>u>>v;
		if(get(u) == get(v))
		{
			cout<<"Yes\n";
		}
		else
		{
			cout<<"No\n";
		}
	}
	return 0;
 } 