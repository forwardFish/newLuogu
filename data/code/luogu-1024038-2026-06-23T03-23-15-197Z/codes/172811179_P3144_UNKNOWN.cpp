#include<bits/stdc++.h>
using namespace std;
const int maxn=1e5+5;
int fa[maxn],n,m;
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
int main()
{
	cin>>n>>m;
	for(int i=1;i<=m;i++)
	{
		int x,y;cin>>x>>y;
		merge(x,y);
	}
	init();
	for(int i=1;i<=n;i++)
	{
		cout<<"NO\n";
	}
	return 0;
}
