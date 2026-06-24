#include<bits/stdc++.h>
#define int long long
#define endl "\n"
using namespace std;
const int maxn=5e2+5;
int a[maxn][maxn];
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	int n;
	cin>>n;
	bool pd=1;
	for(int i=1;i<=n;i++)
	{
		for(int i=1;i<=n;i++)
		{
			cin>>a[i][j];
			if(a[i][j]==100) pd=0;
		 } 
	}
	if(pd) cout<<0;
	
	return 0;
 }
