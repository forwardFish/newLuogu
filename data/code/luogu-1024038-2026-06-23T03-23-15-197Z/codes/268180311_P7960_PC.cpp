#include<bits/stdc++.h>
#define int long long 
#define endl "\n"
using namespace std;
const int maxn=1e7+5;
bool vis[maxn];
signed main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	for(int i=1;i<=1e7;i++)
	{
		if(vis[i]) continue;
		int cnt=i;
		bool pd=1;
		while(cnt)
		{
			if(cnt%10==7)
			{
				pd=0;
				break;	
			}
			cnt/=10;
		}
		if(pd) continue;
		
		for(int j=1;j*i<=1e7;j++)
		{
			vis[i*j]=1;
		}
	}
	int t;
	cin>>t;
	while(t--)
	{
		int x;cin>>x;
		if(vis[x])
		{
			cout<<-1<<endl;
			continue;
		}
		x++;
		while(vis[x])
		{
			x++;
		}
		cout<<x<<endl;
	}
	return 0;
 } 