#include<cstdio>
#include<algorithm>
using namespace std;
int n,k,x[55],y[55],ans=0x3f3f3f3f;
struct square
{
	int empty=1,x1,x2,y1,y2;
	void join(int u)
	{
		if(empty)
			x1=x2=x[u],y1=y2=y[u];
		empty=0;
		x1=min(x1,x[u]),x2=max(x2,x[u]);
		y1=min(y1,y[u]),y2=max(y2,y[u]);
	}
	int area(){return (x2-x1)*(y2-y1);}
}squ[4];
int is_intersect(int a,int b,int c,int d)
{
	return (a<=c&&c<=b)||(a<=d&&d<=b)||(c<=a&&a<=d)||(c<=b&&b<=d);
}
int is_intersect(int num)
{
	for(int i=0;i<k;i++)
		if(num!=i&&is_intersect(squ[num].x1,squ[num].x2,squ[i].x1,squ[i].x2)&&is_intersect(squ[num].y1,squ[num].y2,squ[i].y1,squ[i].y2))
			return 1;
	return 0;
}
void dfs(int u)
{
	if(u==n+1)
	{
		int sum=0;
		for(int i=0;i<k;i++)sum+=squ[i].area();
		ans=min(ans,sum);
		return;
	}
	for(int i=0;i<k;i++)
	{
		square t=squ[i];
		squ[i].join(u);
		if(!is_intersect(i))
			dfs(u+1);
		squ[i]=t;
	}
}
int main()
{
	scanf("%d %d",&n,&k);
	for(int i=1;i<=n;i++)
		scanf("%d %d",&x[i],&y[i]);
	dfs(1);
	printf("%d",ans);
}