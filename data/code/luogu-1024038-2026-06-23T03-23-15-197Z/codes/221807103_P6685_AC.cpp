#include<bits/stdc++.h>
#define int long long
using namespace std;

signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int cnt=0;
	int n,m;
	cin>>n>>m;
	
	while(1)
	{
		cnt++;
		if(pow(cnt,m)>n)
		{
			break;
		}
		
	}
	cout<<cnt-1;
	return 0;
}



