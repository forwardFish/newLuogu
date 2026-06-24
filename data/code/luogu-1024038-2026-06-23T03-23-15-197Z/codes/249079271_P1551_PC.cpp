#include<bits/stdc++.h> 
using namespace std;
const int maxn=2e5+5;
int n,m,p;
int fa[maxn];
int get(int x)
{
	if(fa[x]==x) return x;
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
int main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	init();
	cin>>n>>m>>p;
	for(int i=1;i<=m;i++)
	{
		int x,y;
		cin>>x>>y;
		merge(x,y);
	}
	for(int i=1;i<=p;i++)
	{
		int u,v;
		cin>>u>>v;
		if(get(u)==get(v))
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