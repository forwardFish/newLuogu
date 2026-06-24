#include<bits/stdc++.h>
#define int long long  
using namespace std;
const int maxn=1e5+5;
int t[maxn*4];
int a[maxn];
void build(int l,int r,int x)
{
	if(l==r)
	{
		t[x]=a[l];
	}
	else
	{
		int mid=(l+r)>>1;
		build(l,mid,2*x);
		build(mid+1,r,2*x+1);
		t[x]=t[x*2]+t[2*x+1];
	}
}
int query(int l,int r,int s,int e,int x,int v)
{
	int ans=0;
	if(s<=l && r<=e)
	{
		return t[x];
	}
	int mid=(l+r)>>1;
	if(s<=mid)
	{
		ans+=query(l,mid,s,e,2*x);
	}
	if(e>mid)
	{
		ans+=query(mid+1,r,s,e,2*x+1);
	}
	return ans;
}
void update(int l,int r,int s,int e,int x)
{
	if(l==r && l==k)
	{
		t[x]+=v;
		return;
	}
	int mid=(l+r)>>1;
	if(l<=mid)
	{
		update(l,mid,k,v,2*x);
	}
	else
	{
		update(mid+1,r,k,v,2*x+1);
	}
	t[x]=t[2*x]+t[2*x+1];
}
signed main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	int n,m;
	cin>>n>>m;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i];
	}
	build(1,n,1);
	while(m--)
	{
		int opt;
		cin>>opt;
		if(opt==1)
		{
			int x,y,k;
			cin>>x>>y>>k;
			update(x,y,)
		}
	}
	return 0;
 } 