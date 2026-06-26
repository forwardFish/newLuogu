#include<bits/stdc++.h>
#define int long long 
using namespace std;
int n,m,k;
const int maxm=1e6+5;
const int maxn=1e4+5;
int fa[maxn+10];
struct node
{
	int u,v,w;
}a[maxm],g[maxm+5];
int c[15];
int get(int x)
{
	if(fa[x]==x) return x;
	return fa[x]=get(fa[x]); 
}
void init(int x)
{
	for(int i=1;i<=x;i++) fa[i]=i;
}
void merge(int x,int y)
{
	fa[get(x)]=get(y);
}

bool cmp(node x,node y)
{
	return x.w<y.w;
}
int cnt;
signed main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	cin>>n>>m>>k;init(n);
	for(int i=1;i<=m;i++)
	{
		cin>>a[i].u>>a[i].v>>a[i].w;
	}
	sort(a+1,a+m+1,cmp);
	for(int i=1;i<=m;i++)
	{
		if(get(a[i].u)!=get(a[i].v))
		{
			g[++cnt]=a[i];merge(a[i].u,a[i].v);
		}
	 } 
	 for(int i=1;i<=k;i++)
	 {
	 	cin>>c[i];
	 	for(int j=1;j<=n;j++)
	 	{
	 		int x;cin>>x;
	 		g[++cnt]={n+i,j,x};
		 }
	 }
	 sort(g+1,g+n+1,cmp);
	 int ans=LLONG_MAX;
	 for(int x=0;x<(1<<k);x++)
	 {
	 	int sum=0;
	 	for(int i=0;i<k;i++)
	 	{
	 		if(x&(1<<i)) sum+=c[i+1]; 
		 }
		 init(n+k);
		 for(int i=1;i<=cnt;i++)
		 {
		 	if(g[i].u<=n || (x&(1<<g[i].u-n-1)))
		 	{
		 		if(get(g[i].u)!=get(g[i].v))
		 		{
		 			sum+=g[i].w;
		 			merge(g[i].u,g[i].v);
				 }
			 }
		 }
		 ans=min(ans,sum);
 
	  } 
	  cout<<ans;
	return 0;
 } 