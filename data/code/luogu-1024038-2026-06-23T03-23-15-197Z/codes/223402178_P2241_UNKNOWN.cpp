#include<bits/stdc++.h>
#define int long long
#pragma GCC optimize(2)
using namespace std;
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int n,m,a=0,b=0;
	cin>>n>>m;
	for(int i=1;i<=n;i++)
	{
		for(int j=1;j<=m;j++)
		{
			if(i==j)
			{
				a+=(n-i+1)*(m-j+1);
			}
			else
			{
				b+=(n-i+1)*(m-j+1);
			}
		}
	 } 
	 cout<<a<<" "<<b;
	return 0;
}



