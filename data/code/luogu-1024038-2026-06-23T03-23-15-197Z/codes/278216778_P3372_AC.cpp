#include<bits/stdc++.h>
using ll=long long;
using lld=unsigned long long;
using namespace std;
inline int read()
{
    int x=0,f=1;char ch=getchar();
    while(!isdigit(ch)){if(ch=='-') f=-1;ch=getchar();}
    while(isdigit(ch)){x=x*10+ch-'0';ch=getchar();}
    return x*f;
}
inline void write(int x)
{
    if(x<0){putchar('-');x=-x;}
    if(x>9) write(x/10);
    putchar(x%10+'0');
}
#define int long long
#define endl "\n"
const int mod1=19650827;
const int mod=1e9+7;
const int maxn=1e5+5;
int a[maxn];
int w[maxn*4];
int lzy[maxn*4]; 
bool in(int l,int r,int s,int e)
{
	return (l<=s && e<=r);
}
bool out(int l,int r,int s,int e)
{
	return (e<l || s>r);
}
void maketag(int u,int len,int x)
{
	lzy[u]+=x;
	w[u]+=len*x;
}
void pushdown(int u,int l,int r)
{
	int mid=(l+r)>>1;
	maketag(2*u,mid-l+1,lzy[u]);
	maketag(2*u+1,r-mid,lzy[u]);
	lzy[u]=0;
}
void pushup(int u)
{
	w[u]=w[2*u]+w[2*u+1];
}
void build(int u,int l,int r)
{
	if(l==r)
	{
		w[u]=a[l];
	}
	else
	{
		int mid=(l+r)>>1;
		build(u*2,l,mid);
		build(u*2+1,mid+1,r);
		pushup(u); 
	}
}
void update(int u,int s,int e,int l,int r,int k)
{
	if(in(l,r,s,e))
	{
		maketag(u,e-s+1,k);
	}
	else if(!out(l,r,s,e))
	{
		int mid=(s+e)>>1;
		pushdown(u,s,e);
		update(2*u,s,mid,l,r,k);
		update(2*u+1,mid+1,e,l,r,k);
		pushup(u);
	}
	
}
int query(int u,int s,int e,int l,int r)
{
	if(in(l,r,s,e))
	{
		return w[u];
	}
	else if(!out(l,r,s,e))
	{
		int mid=(s+e)>>1;
		pushdown(u,s,e);
		return query(2*u,s,mid,l,r)+query(2*u+1,mid+1,e,l,r);
	}
	else
	{
		return 0;
	}
}
signed main()
{
	ios::sync_with_stdio(false);
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
	 	int opt,x,y,k;
	 	cin>>opt;
	 	if(opt==1)
	 	{
	 		cin>>x>>y>>k;
	 		update(1,1,n,x,y,k);
		 }
		 else
		 {
		 	cin>>x>>y;
		 	cout<<query(1,1,n,x,y)<<endl;
		 }
	 }
	return 0;
}







