#include<bits/stdc++.h>
using namespace std;
const int maxn=1e5+5;
int n,q,c[maxn];
struct tree
{
	int l,r,v;
}a[maxn];
void f(int x)
{
	if(a[x].v==1) a[x].v=0;
	else a[x].v=1;
	if(a[x].l!=0) f(a[x].l);
	if(a[x].r!=0) f(a[x].r);
}
int main(){
	cin>>n;
	a[1].l=a[1].r=0;
	for(int i=2;i<=n;i++)
	{
		int p;
		cin>>p;
		if(a[p].l==0) 
		{
			a[p].l=i;
		}
		else 
		{
			a[p].r=i;
		}
	}
	string s;
	cin>>s;
	s=' '+s;
	for(int i=1;i<=n;i++)
	{
		a[i].v=s[i]-'0';
	}
	cin>>q;
	for(int i=1;i<=q;i++)
	{
		int x;
		cin>>x;
		if((c[x]+1)%2==0) continue;
		f(x);
		c[x]++;
	}
	for(int i=1;i<=n;i++)
	{
		cout<<a[i].v;
	}

	return 0;
}
