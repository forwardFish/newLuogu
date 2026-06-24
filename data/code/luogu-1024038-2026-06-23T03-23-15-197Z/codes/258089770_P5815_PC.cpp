#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=55;
int a[maxn]; 
signed main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	int n,m;
	cin>>n>>m;
	int ans=m;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i];
		ans+=a[i];
	}
	cout<<ans/n;
	return 0;
 } 