#include<bits/stdc++.h>
using namespace std;
const int maxn=5e5+5;
long long  dp[maxn];
struct node
{
	long long a,b;
}l[maxn];
bool cmp(node x,node y)
{
	return x.b<y.b;
}
int main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		cin>>l[i].a;
	 } 
	 for(int i=1;i<=n;i++)
	 {
	 	cin>>l[i].b;
	 }
	 sort(l+1,l+n+1,cmp);
	 long long ans=0,cnt=0;
	 for(int i=1;i<=n;i++)
	 {
	 	for(int j=min(cnt,l[i].b);j>=0;j--)
	 	{
	 		dp[j+l[i].b]=max(dp[j+l[i].b],dp[j]+l[i].a*(l[i].b-1));
		 }
		 cnt+=l[i].b;
	 }
	 for(int i=1;i<=maxn-5;i++)
	 {
	 	ans=max(ans,dp[i]);
	 }
	for(int i=1;i<=n;i++)
	{
		ans+=l[i].a;
	}
	cout<<ans;
	return 0;
}




