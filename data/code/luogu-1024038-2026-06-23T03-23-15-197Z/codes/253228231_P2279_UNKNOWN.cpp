#include<bits/stdc++.h>
using namespace std;
const int maxn=1e3+5;
bool a[maxn],b[maxn],c[maxn];
int fa[maxn];
int d[maxn];
int u[maxn];
bool cmp(int x,int y)
{
	return d[x]>d[y];
}
bool check(int x,int dd)
{
	if(dd==0) 
	{
		return (!(a[x]) && !(b[x]) && !(c[x]));
	}
	if(dd==1)
	{
		return ((!a[x]) && !(b[x]));
	}
	if(dd==2)
	{
		return !a[x];
	}
}
int main()
{
	int n;
	cin>>n;
	u[1]=1;
	for(int i=2;i<=n;i++)
	{
		cin>>fa[i];
		d[i]=d[fa[i]]+1;
		u[i]=i;
	}
	int ans=0;
	sort(u+1,u+n+1,cmp);
	for(int i=1;i<=n;i++)
	{
		int x=u[i],y=fa[x],z=fa[y];
		if(check(x,0) && check(y,0) && check(z,0))
		{
			ans++;
			a[x]=1,b[y]=1,c[z]=1;
		}
	}
	cout<<ans;
	return 0;
}
