#include<bits/stdc++.h>
using namespace std; 
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
	if(fx!=fy) 
	{
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