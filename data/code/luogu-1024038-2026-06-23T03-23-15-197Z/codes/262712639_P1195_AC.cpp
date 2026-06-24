#include<bits/stdc++.h>
using namespace std; 
const int maxn=2e5+5;
int n,m,k,ans=0,sum;
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
int main()
{
	cin>>n>>m>>k;
	for(int i=1;i<=n;i++) fa[i]=i; 
	for(int i=1;i<=m;i++)
	{
		cin>>a[i].u>>a[i].v>>a[i].w;
	}
	sort(a+1,a+m+1,cmp);
	sum=n;
	for(int i=1;i<=m;i++)
	{
		if(sum<=k) break;
		int x=get(a[i].u);
		int y=get(a[i].v);
		if(x!=y) 
		{
			sum--;
			ans+=a[i].w;
			fa[x]=y;
		} 
	}
	if(sum==k) cout<<ans;
	else cout<<"No Answer";
	return 0;
}