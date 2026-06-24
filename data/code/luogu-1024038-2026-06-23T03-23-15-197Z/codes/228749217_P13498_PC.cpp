#include<bits/stdc++.h>
#define int long long 
using namespace std;
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int n,m;
	cin>>n>>m;
	for(int i=1;i<=n;i++)
	{
		string s;
		cin>>s;
		bool pd=1;
		int sum=1;
		for(char c:s)
		{
			int d=c-'0';
			if(d==0)
			{
				pd=1;
				break;
			}
			if(sum>m/d)
			{
				pd=0;
				break;
			}
			sum*=d;
		}
		if(pd)
		{
			cout<<"kawaii"<<endl;
		}
		else
		{
			cout<<"dame"<<endl;
		}
	 } 
	return 0;
}






