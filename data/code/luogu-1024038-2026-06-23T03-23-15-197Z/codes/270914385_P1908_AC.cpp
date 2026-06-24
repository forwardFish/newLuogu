#include<bits/stdc++.h>
//#pragma GCC optimize(2)
#define int long long
#define endl "\n" 
using namespace std;
const int maxn=5e5+5;

int n,m;
int t[maxn];
int r[maxn];
int lowbit(int x)
{
	return x&(-x);
}
struct node
{
	int v,id;
}a[maxn];
void update(int x,int k)
{
	while(x<=n)
	{
		t[x]+=k;
		x+=lowbit(x);
	}
}
int add(int x)
{
	int ans=0;
	while(x>0)
	{
		ans+=t[x];
		x-=lowbit(x);
	}
	return ans;
}
bool cmp(node x,node y)
{
	if(x.v==y.v) return x.id<y.id;
	return x.v<y.v;
}
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i].v;a[i].id=i;

	 }sort(a+1,a+n+1,cmp);
	 for(int i=1;i<=n;i++)
	 {
	 	r[a[i].id]=i;
	 }
	 int ans=0;
	 for(int i=1;i<=n;i++)
	 {
	 	ans+=add(n)-add(r[i]);
	 	update(r[i],1);
	 }
	 cout<<ans;
	return 0;
}

