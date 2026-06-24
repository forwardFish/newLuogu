#include<bits/stdc++.h>
using namespace std;
#define int long long
int sum[11];
int pow(int a,int b)
{
	int s=1;
	for(int i=1;i<=b;i++)
	{
		s*=a;
	}
	return s;
}
signed main()
{
	int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		sum[i]=pow(i,i);
	}
	int ans=0;
	for(int i=1;i<=n;i++)
	{
		ans+=sum[i];
	}
	cout<<ans;
	return 0;
 }
