#include<bits/stdc++.h>
#pragma GCC optimize(2)
#define int long long
using namespace std;
const int maxn=1e5+5;
int sum[maxn];
bool pd(int x)
{
	if(x<=1) return 0;
	for(int i=2;i*i<=x;i++)
	{
		if(x%i==0)
		{
			return 0;
		}
	}
	return 1;
}
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	sum[1]=0;
	for(int i=2;i<=maxn;i++)
	{
		sum[i]=sum[i-1];
		if(i%2==0) continue;
		if(pd(i)==1 && pd((i+1)/2)==1)
		{
			sum[i]=sum[i-1]+1;
		}
	}
	int t;
	cin>>t;
	while(t--)
	{
		int l,r;
		cin>>l>>r;
		cout<<sum[r+1]-sum[l-1]<<endl;
	}
	return 0;
 }

