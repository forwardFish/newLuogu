#include<bits/stdc++.h>
#define int long long
using namespace std;
map<int,int>tx,ty;
const int maxn=1e5+5;
struct node
{
	int x,y,s;
}a[maxn];
int t[maxn]; 
int nx,ny;
bool cmp(node aa,node bb)
{
	if(aa.x==bb.x)
	{
		return aa.y<bb.y; 
	}
	return aa.x<bb.x;
}
int lowbit(int x)
{
	return x&(-x);
}
void add(int x,int k)
{
	while(x<=ny)
	{
		t[x]=max(t[x],k);x+=lowbit(x);
	}
}
int sum(int x)
{
	int ans=0;
	while(x>0)
	{
		ans=max(ans,t[x]);
		x-=lowbit(x);	
	}
	return ans;
}
int x[maxn],y[maxn],dp[maxn];
signed main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	int n,m,k;
	cin>>n>>m>>k;
	for(int i=1;i<=k;i++)
	{
		cin>>a[i].x>>a[i].y>>a[i].s;
		x[i]=a[i].x;
		y[i]=a[i].y;
	}	
	x[0]=y[0]=1;
	sort(x,x+k+1);
	sort(y,y+k+1);
	tx[x[0]]=++nx;
	ty[y[0]]=++ny;	
	for(int i=1;i<=k;i++)
	{
		if(x[i]!=x[i-1])
		{
			tx[x[i]]=++nx;
		}
		if(y[i]!=y[i-1])
		{
			ty[y[i]]=++ny;
		}
	}
	for(int i=1;i<=k;i++)
	{
		a[i].x=tx[a[i].x];
		a[i].y=ty[a[i].y];
	}
	sort(a+1,a+k+1,cmp);
	for(int i=1;i<=k;i++)
	{		
		dp[i]=sum(a[i].y)+a[i].s;	
		add(a[i].y,dp[i]);	
	}
	int ans=0;
	for(int i=1;i<=n;i++)
	{
		ans=max(ans,dp[i]);
	}
	cout<<ans;
	return 0;
 }
