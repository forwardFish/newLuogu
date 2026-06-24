#include<bits/stdc++.h>
using namespace std;
int n,a[100005],sum,ans,ans1;
int main()
{
	cin>>n;
	for(int i=0;i<n;i++)
	{
		cin>>a[i];
		sum+=a[i];
		ans1=max(ans1+a[i],0);
		ans=max(ans,ans1);
	}
	cout<<ans-(sum-ans);
	return 0;
}