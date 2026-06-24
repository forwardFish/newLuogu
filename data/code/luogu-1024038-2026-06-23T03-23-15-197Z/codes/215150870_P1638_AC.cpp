#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=1e6+5;
int sum[maxn],a[maxn];
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
	 int l=1,r=1,cnt=0,ans=INT_MAX,ansl,ansr;
	 while(l<=r && r<=n+1)
	 {
	 	if(cnt<m)
	 	{
	 		r++;
	 		sum[a[r-1]]++;
	 		if(sum[a[r-1]]==1)
	 		{
	 			cnt++;
			 }
		 }
		 else
		 {
		 	if(ans>r-l)
		 	{
		 		ans=r-l;
		 		ansl=l;
		 		ansr=r-1;
			 }
			 sum[a[l]]--;
			 if(sum[a[l]]==0)
			 {
			 	cnt--;
			 }
			 l++;
		 }
	 }
	 cout<<ansl<<" "<<ansr;
	return 0;
}



