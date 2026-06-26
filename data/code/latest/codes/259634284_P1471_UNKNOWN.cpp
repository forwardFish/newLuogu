#include<bits/stdc++.h>
using namespace std;
const int maxn=1e5+5;
int a[maxn];
struct node
{
	double sum,tag;
}t1[maxn*4],t2[maxn*4];
void pushdown(int x,int l,int r)
{
	if(l==r) return;
	int mid=(l+r)>>1;
	t2[2*x].sum+=t1[x*2].sum*(t2[x].tag*2)+(mid-l+1)*(t2[x].tag*t2[x].tag);
	t2[2*x+1].sum+=t1[x*2+1].sum*(t2[x].tag*2)+(r-mid)*(t2[x].tag*t2[x].tag);
	t2[2*x].tag+=t2[x].tag; 
	t2[2*x+1].tag+=t2[x].tag;
	t2[x].tag=0;
	t1[2*x].sum+=(mid-l+1)*t1[x].tag;
	t1[2*x+1].sum+=(r-mid)*t1[x].tag;
	t1[2*x].tag+=t1[x].tag;
	t1[2*x+1].tag+=t1[x].tag;
	t1[x].tag=0;
 } 
void build(int x,int l,int r)
{
	if(l==r)
	{
		t1[x].sum=a[l];
		t2[x].sum=a[l]*a[l];
		return;
	}
	else
	{
		int mid=(l+r)>>1;
		build(2*x,l,mid);
		build(2*x+1,mid+1,r);
		t1[x].sum=t1[2*x].sum+t1[2*x+1].sum;
		t2[x].sum=t2[2*x].sum+t2[2*x+1].sum;
	}
}
double query(node t[],int x,int l,int r,int s,int e)
{
	int ans=0;
	if(s<=l && r<=e)
	{
		return t[x].sum;
	}
	if(t[x].tag) pushdown(x,l,r);
	int mid=(l+r)>>1;
	if(s<=mid)
	{
		ans+=query(t,2*x,l,mid,s,e);
	}
	if(e>mid)
	{
		ans+=query(t,2*x+1,mid+1,r,s,e);
	}
	t1[x].sum=t1[2*x].sum+t1[2*x+1].sum;
	t2[x].sum=t2[2*x].sum+t2[2*x+1].sum;
	return ans;
}
void update(int x,int l,int r,int s,int e,double v)
{
	if(s<=l && r<=e)
	{	
		t2[x].sum+=t1[x].sum*(v*2)+(r-l+1)*(v*v);
		t2[x].tag+=v;
		t1[x].sum+=(r-l+1)*v;
		t1[x].tag+=v;
	
		return;
	}
	if(t1[x].tag || t2[x].tag) pushdown(x,l,r);
	int mid=(l+r)>>1;
	if(s<=mid)
	{
		update(2*x,l,mid,s,e,v);
	}
	if(e>mid)
	{
		update(2*x+1,mid+1,r,s,e,v);
	}
	t1[x].sum=t1[2*x].sum+t1[2*x+1].sum;
	t2[x].sum=t2[2*x].sum+t2[2*x+1].sum;
}
int main()
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
			double k;
			cin>>k;
			update(1,1,n,x,y,k);
		}
		else if(opt==2)
		{
			printf("%0.4lf\n",query(t1,1,1,n,x,y)*1.0/(y-x+1));
		}
		else
		{
			printf("%0.4lf\n",query(t2,1,1,n,x,y)*1.0/(y-x+1)-query(t1,1,1,n,x,y)*1.0/(y-x+1)*query(t1,1,1,n,x,y)*1.0/(y-x+1));
		}
	}
	return 0;
 } 