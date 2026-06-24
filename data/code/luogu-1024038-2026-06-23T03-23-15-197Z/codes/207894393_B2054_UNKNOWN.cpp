#include<bits/stdc++.h>
#pragma GCC optimize(2)
#define int long long
using namespace std;
const int maxn=1e2+5;
int a[maxn];
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int n;
	cin>>n; double ans=0;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i];
		ans+=a[i];
	}
	cout<<ans/n;
	return 0;
 }

