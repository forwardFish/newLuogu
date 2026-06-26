#include<bits/stdc++.h>
using namespace std;
int a,b;
int c[30005];
void put(int d)
{
	int son,pa;
	c[++b]=d;
	son=b;
	while(son>1)
	{
		pa=son>>1;
		if(c[son]>=c[pa])
		{
			break;
		}
		swap(c[son],c[pa]);
		son=pa;
	}
}
int get()
{
	int pa,son,res;
	res=c[1];
	c[1]=c[b--];
	pa=1;
	while(pa*2<=b)
	{
		son=pa*2;
		if(son<b&&c[son+1]<c[son])
		{
			son++;
		}
		if(c[pa]<=c[son])
		{
			break;
		}
		swap(c[pa],c[son]);
		pa=son;
	}
	return res;
}
void work()
{
	int x,y;
	long ans=0;
	cin>>a;
	for(int i=1;i<=a;i++)
	{
		cin>>x;
		put(x);
	}
	for(int i=1;i<a;i++)
	{
		x=get();
		y=get();
		ans+=x+y;
		put(x+y);
	}
	cout<<ans;
}
int main()
{
	ios::sync_with_stdio(false);
	work();
	return 0;
} 