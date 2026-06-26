#include<bits/stdc++.h>
using namespace std;
const int maxn=1e6+5;
int fa[maxn],n,a[maxn];
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
int main()
{
	cin>>n;
	init();
	for(int i=1;i<=n;i++) 
	{
		cin>>a[i];
		merge(a[i],i);
	}
	int ans=0;
	for(int i=1;i<=n;i++)
	{
		if(get(i)==i) ans++;
	}
	cout<<ans;
	return 0;
}
