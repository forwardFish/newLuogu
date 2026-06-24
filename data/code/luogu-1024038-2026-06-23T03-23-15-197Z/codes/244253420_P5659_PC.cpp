#include<bits/stdc++.h>
using namespace std;
#define N 4007
#define mem(x) memset(x,0,sizeof(x))
int p[N],ans[N],vis[N];
int fa[N];
int find(int x)
{
    return fa[x]==x?x:fa[x]=find(fa[x]);
}
int main()
{
    int n,t;
    scanf("%d",&t);
    while(t--)
    {
	scanf("%d",&n);
	for(int i=1;i<=n;i++)
	    fa[i]=i;
	mem(vis);
	for(int i=1;i<=n;i++)
	    scanf("%d",&p[i]);
	int x,y;
	for(int i=1;i<n;i++)
	    scanf("%d%d",&x,&y);
	for(int i=1;i<=n;i++)
	{
	    int x=p[i];
	    for(int j=1;j<=n;j++)
	    {
		if(!vis[j]&&(i==n||find(x)!=find(j)))
		{
		    ans[i]=j;
		    fa[find(x)]=find(j);
		    vis[j]=1;
		    break;
		}
	    }
	}
	for(int i=1;i<=n;i++)
	    printf("%d ",ans[i]);
	printf("\n");
    }
    return 0;
}
