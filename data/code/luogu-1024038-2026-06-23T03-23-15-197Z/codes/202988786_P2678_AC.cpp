#include<bits/stdc++.h>
using namespace std;
const int maxn=5e4+5;
int a[maxn];
int L,m,n;
bool check(int mid)
{
	int cnt=0,ans=0;
	for(int i=1;i<=n;i++)
	{
		if(a[i]-cnt>=mid)
		{
			cnt=a[i];
		}
		else
		{
			ans++;
		}
	}
	return ans<=m;
}
int main()
{
	cin>>L>>n>>m;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i];
	 } 
	 int l=1,r=L,ans=0,mid;
	 while(l<=r)
	 {
	 	int mid=(l+r)/2;
	 	if(check(mid))
	 	{
	 		l=mid+1;
	 		ans=mid;
		 }
		 else
		 {
		 	r=mid-1;
		 }
	 }
	 cout<<ans;
	return 0;
}
