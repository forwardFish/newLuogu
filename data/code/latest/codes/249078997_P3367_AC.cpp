#include<bits/stdc++.h>
using namespace std;
const int maxn=2e5+5;
int fa[maxn];
int siz[maxn];
int get(int x)
{
	if(fa[x] == x) return x;
	return fa[x]=get(fa[x]);
}
void merge(int x,int y)
{
	fa[get(x)]=get(y);
}
int main()
{
	int n,m;
	cin>>n>>m;
	for(int i=1;i<=n;i++) fa[i]=i,siz[i]=1;
	for(int i=1;i<=m;i++)
	{
		int opt,u,v;cin>>opt>>u>>v;
		if(opt==1)
		{
			merge(u,v);
		}
		else 
		{
			if(get(u)==get(v))
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