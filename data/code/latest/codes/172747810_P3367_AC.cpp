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
	int n,m;
	cin>>n>>m;
	for(int i=1;i<=n;i++) fa[i]=i,siz[i]=1;
	for(int i=1;i<=m;i++)
	{
		int opt,u,v;cin>>opt>>u>>v;
		if(opt == 1)
		{
			merge(u,v);
		}
		else 
		{
			if(get(u) == get(v))
			{
				cout<<"Y\n";
			}
			else
			{
				cout<<"N\n";
			}
		}
	}
	return 0;
 } 