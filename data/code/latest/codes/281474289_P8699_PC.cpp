#include<bits/stdc++.h>
#define int long long 
#define endl "\n"
using namespace std;
const int mod=123456;
const int maxn=25;int n,k;
int a[maxn];
bool pd[maxn];
int ans=0;
int f()
{
	int cnt=0;
	for(int i=2;i<=n-1;i++)
	{
		if((a[i]>a[i-1] && a[i]>a[i+1]) || (a[i]<a[i-1] && a[i]<a[i+1]))
		{
			cnt++;
		}
	}
	return cnt;
}
void dfs(int x)
{
	if(x==n)
	{
		int cnt=f();
		if(cnt==k-1)
		{
			ans++;
		}
		return ;
	}
	for(int i=1;i<=n;i++)
	{
		if(!pd[i])
        {
            pd[i]=1;
            a[x+1]=i;
            dfs(x+1);
            pd[i]=0;
        }
	}
}
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	cin>>n>>k;
	if(k-1>n/2+1)
	{
		cout<<0;
		return 0;
	 } 
	dfs(0);
	cout<<ans;
	return 0;
 } 