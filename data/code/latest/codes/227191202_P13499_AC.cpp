#include<bits/stdc++.h>
#define int long long  
using namespace std;
const int maxn=5e5+5; 
bool vis[maxn];
int d[maxn];
int a[maxn];
int l[maxn];
int sum[maxn],u[maxn];
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
		l[a[i]]=i;
	 } 
	 for(int i=1;i<=m;i++)
	 {
	 	int x=i,cnt=0;
	 	while(x)
	 	{
	 		x/=10;
	 		cnt++;
		 }
		 d[i]=cnt;
	 }
	 int s=0;
	 int ans=0;
	 for(int i=1;i<=n;i++)
	 {
	 	if(!vis[a[i]])
	 	{
	 		vis[a[i]]=1;
	 		ans++;
	 		s+=d[a[i]];
		 }
		 u[i]=ans;
		 sum[i]=s;
	 }
	 for(int i=1;i<=m;i++)
	 {
	 	int p=l[i];
	 	ans=sum[p]+u[p]-1;
	 	cout<<ans<<" ";
	 }
	return 0;
}






