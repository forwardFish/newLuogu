#include<bits/stdc++.h>
#define int long long
#define endl "\n"
using namespace std;
const int maxn=65540;
int a[maxn],sum[maxn];

signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	int n,k;
	cin>>n>>k;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i];
		a[i]=(a[i]+11)/12;
	 }
	 sort(a+1,a+n+1);
	 int ans=a[n]*12;
	 for(int i=1;i<=n;i++)
	 {
	 	sum[i]=a[i-1]-a[i];
	  } 
	  for(int i=1;i<=k-1;i++)
	  {
	  	if(!sum[i]) break;
	  	ans+=(sum[i]+1)*12;
	  }
	  cout<<ans;
	return 0;
 }
