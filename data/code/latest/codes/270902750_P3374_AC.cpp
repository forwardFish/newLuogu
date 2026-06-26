#include<bits/stdc++.h>
//#pragma GCC optimize(2)
#define int long long
#define endl "\n" 
using namespace std;
const int maxn=5e5+5;
int a[maxn];
int n,m;
int t[maxn];
int lowbit(int x)
{
	return x&(-x);
}
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
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	cin>>n>>m;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i];
		update(i,a[i]);
	 } 
	 while(m--)
	 {
	 	int opt,x,y;
	 	cin>>opt>>x>>y;
	 	if(opt==1)
	 	{
	 		update(x,y);
		 }
		 else
		 {
		 	cout<<add(y)-add(x-1)<<endl;
		 }
	 }
	return 0;
}

