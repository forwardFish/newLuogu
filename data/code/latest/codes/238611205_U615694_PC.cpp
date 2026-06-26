#include<bits/stdc++.h>
#define int long long
using namespace std;
int sum(int n)
{
	return n*(n+1)/2;
 } 
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int n,k,p;
	cin>>n>>k>>p;
	int ans=0;
	int power=1;
	if(k==0)
	{
		cout<<sum(n);
	 } 
	 else
	 {
	 	for(int i=0;i<k;i++)
	 	{
	 		if(power>n) break;
	 		int c1=n/power;
	 		int c2=n/(power*p);
	 		ans+=sum(c1)-p*sum(c2);
	 		if(power>n/p) break;
	 		power*p;
		 }
		 if(power<=n)
		 {
		 	ans+=sum(n/power); 
		 }
		 cout<<ans;
	 }
	return 0;
}

