#include<iostream>
#include<cstdio>
using namespace std;
int sum[500],dep[500],m,n,a[500][500],fa[500],num[500],p,map[500][500],maxx;
bool f[500];
bool fin(int x) 
{
	if (x==1) return false;
	if (f[x]) return true;
	return fin(fa[x]);
}
void build(int x,int depth) 
{
	int i;
	dep[x]=depth;
	num[depth]++;
	m=max(m,depth);
	a[depth][num[depth]]=x;
	    sum[x]=1;
	for (i=1; i<=map[x][0]; i++)
		if (fa[x]!=map[x][i]) 
		{
			fa[map[x][i]]=x;
			build(map[x][i],depth+1);
			sum[x]+=sum[map[x][i]];
		}
}
void dfs(int depth,int ans) 
{
	if (depth==m+1)
		return;
	int n1=num[depth],i,x;
	for (i=1; i<=n1; i++) 
	{
		x=a[depth][i];
		  if (fin(x))
			  continue;
		f[x]=true;
		maxx=max(maxx,ans+sum[x]);
		dfs(depth+1,ans+sum[x]);
		f[x]=false;
	}
}
int main() 
{
	scanf("%d %d",&n,&p);
	int i,x,y;
	for (i=1; i<=p; i++) 
	{
		scanf("%d %d",&x,&y);
		map[x][0]++;
		map[x][map[x][0]]=y;
		map[y][0]++;
		map[y][map[y][0]]=x;
	}
	build(1,1);
	dfs(2,0);
	printf("%d",n-maxx);
}