#include<bits/stdc++.h>
using namespace std;
#define int long long
const int maxn=1e5+10;
int fa[maxn],p[maxn];
int a,b,c;
int get(int x)
{
	if(fa[x] == x) return x;
	return fa[x]=get(fa[x]);
}
void merge(int x,int y)
{
	fa[get(x)]=get(y);
}
signed main()
{
	cin>>a>>b>>c;
	for(int i=1;i<=b;i++) fa[i]=i;
	for(int i=2;i<=b;i++)
	{
		if(!p[i])
		{
			int f=0;
			for(int j=1;j*i<=b;j++)
			{
				if(i>=c && i*j>=a && !f)
				{
					f=i*j;
				}
				else if(i>=c && i*j>=a && f)
				{
					merge(i*j,f);
				}
				if(j!=1)
				{
					p[i*j]=1;
				}
				
			}
			
		}
	}
	int ans=0;
	for(int i=a;i<=b;i++)
	{
		if(get(i)==i) ans++;
	}
	
	cout<<ans;
	return 0;
}