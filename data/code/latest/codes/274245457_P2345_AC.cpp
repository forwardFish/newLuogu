#include<iostream>

#define int long long
#define endl "\n"
using namespace std;
const int maxn=2e4+5;
int v[maxn],x[maxn];
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		cin>>v[i]>>x[i];
	}
	int ans=0;
	for(int i=1;i<=n;i++)
	{
		for(int j=i+1;j<=n;j++)
		{
			ans+=max(v[i],v[j])*abs(x[i]-x[j]);
		}
	}
	cout<<ans;
	return 0;
}
