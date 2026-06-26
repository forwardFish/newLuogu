#include<bits/stdc++.h>
using namespace std;
const int maxn=5e5+5;
int fa[maxn][30];
int d[maxn];
vector<int> g[maxn]; 
void dfs(int now,int f)
{
	fa[now][0]=f;
	d[now]=d[f]+1;
	for(int i:g[now])
	{
		if(i!=f)
		{
			dfs(i,now);
		}
	}
}
int lca(int x,int y)
{
	if(d[x]>d[y]) swap(x,y);
	int tmep=d[y]-d[x];
	int r=0;
	while(tmep)
	{
		if(tmep&1)
		{
			y=fa[y][r];
		}
		r++;
		tmep>>=1;
	}
	if(x==y) return x;
	for(int i=21;i>=0;i--)
	{
		if(fa[x][i]!=fa[y][i])
		{
			x=fa[x][i];
			y=fa[y][i];
		}
	}
	return fa[x][0];
}
int main()
{
	int n,m,s;
	cin>>n>>m>>s;
	for(int i=1;i<n;i++)
	{
		int x,y;
		cin>>x>>y;
		g[x].push_back(y);
		g[y].push_back(x);
	}
	dfs(s,0);
	for(int j=1;j<=log2(n);j++)
	{
		for(int i=1;i<=n;i++)
		{
			fa[i][j]=fa[fa[i][j-1]][j-1];
		}
	}
	while(m--)
	{
		int x,y;
		cin>>x>>y;
		cout<<lca(x,y)<<endl;
	}
	return 0;
}
