#include<bits/stdc++.h>
#define int long long 
using namespace std;
const int maxn=5e5+5;
int t[maxn],a[maxn];
int n;
int lowbit(int x)
{
	return x&(-x);
}
int add(int x,int k)
{
	while(x<=n)
	{
		t[x]+=k;x+=lowbit(x);
	}
}
int sum(int x)
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
	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	int m;
	cin>>n>>m;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i];
		add(i,a[i]);
	}
	while(m--)
	{
		int opt,x,y,k;
		cin>>opt;
		if(opt==1)
		{
			cin>>x>>k;
			add(x,k);
		}
		else
		{
			cin>>x>>y;
			cout<<sum(y)-sum(x-1)<<endl;
		}
	}
	return 0;
}