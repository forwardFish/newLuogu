#include<bits/stdc++.h>
using namespace std;
const int N=1e5+5;
int n,a[N];
int main()
{
	cin>>n;
	for(int i=1;i<=n;i++) cin>>a[i];
	sort(a,a+n);
	int ans=1,sum[N];
	for(int i=1;i<=n;i++)
	{
		sum[i]=sum[i-1]+a[i];
	}
	for(int i=2;i<=n;i++)
	{
		if(a[i]>=sum[i-1])
		{
			ans++;
		}
	}
	cout<<ans;
	return 0;
}