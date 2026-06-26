#include<bits/stdc++.h>
using namespace std;
const int maxn=1e3+5;
struct node
{
	int x,y;
}p[maxn];
bool cmp(node a,node b)
{
	if(a.x!=b.x)
	{
        return a.x<b.x;		
	}
	return a.y<b.y;
}
int main()
{

	int n,a,b,c;
	cin>>n>>a>>b>>c;
	for(int i=1;i<=n;i++)
	{
		cin>>p[i].x>>p[i].y;
	}
	sort(p+1,p+n+1,cmp);
	for(int i=1;i<=n;i++)
	{
		if(p[i].y>p[i+1].y)
		{
			cout<<"no solution";
			return 0;
		}
	}
	int ans=0;
	for(int i=1;i<=n;i++)
	{
		int xx=p[i].x-p[i-1].x;
		int yy=p[i].y-p[i-1].y;
		if(c<=a+b)
		{
			ans=ans+min(xx,yy)*c;
			if(x>y)
			{
				ans=ans+(xx-yy)*b;
			}
			else
			{
				ans=ans+(yy-xx)*a;
			}
		}
		else
		{
			ans=ans+(xx*b+yy*a);
		}
	}
	
	cout<<ans;
	return 0;
}
