#include<bits/stdc++.h>
#define int long long 
using namespace std;
const int maxn=1e5+5;
int a[maxn];
struct node
{
	int sum,tag;
}t[maxn*4];
void pushdown(int x,int l,int r)
{
	if(l==r) return;
	int mid=(l+r)>>1;
	t[2*x].sum+=(mid-l+1)*t[x].tag;
	t[2*x+1].sum+=(r-mid)*t[x].tag;
	t[2*x].tag+=t[x].tag;
	t[2*x+1].tag+=t[x].tag;
	t[x].tag=0;
 } 
void build(int x,int l,int r)
{
	if(l==r)
	{
		t[x].sum=a[l];
	}
	else
	{
		int mid=(l+r)>>1;
		build(2*x,l,mid);
		build(2*x+1,mid+1,r);
		t[x].sum=t[2*x].sum+t[2*x+1].sum;
	}
}
int query(int x,int l,int r,int s,int e)
{
	int ans=0;
	if(s<=l && r<=e)
	{
		return t[x].sum;
	}
	pushdown(x,l,r);
	int mid=(l+r)>>1;
	if(s<=mid)
	{
		ans+=query(2*x,l,mid,s,e);
	}
	if(e>mid)
	{
		ans+=query(2*x+1,mid+1,r,s,e);
	}
	return ans;
}
void update(int x,int l,int r,int s,int e,int v)
{
	if(s<=l && r<=e)
	{
		t[x].sum+=(r-l+1)*v;
		t[x].tag+=v;
		return;
	}
	pushdown(x,l,r);
	int mid=(l+r)>>1;
	if(s<=mid)
	{
		update(2*x,l,mid,s,e,v);
	}
	if(e>mid)
	{
		update(2*x+1,mid+1,r,s,e,v);
	}
	t[x].sum=t[2*x].sum+t[2*x+1].sum;
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
	build(1,1,n);
	while(m--)
	{
		int opt,x,y;
		cin>>opt>>x>>y;
		if(opt==1)
		{
			int k;
			cin>>k;
			update(1,1,n,x,y,k);
		}
		else
		{
			cout<<query(1,1,n,x,y)<<'\n';
		}
	}
	return 0;
 } 