#include<bits/stdc++.h>
#define int long long 
#define endl "\n"
using namespace std;
const int maxn=1e7+100;
bool vis[maxn];
int a[maxn];
signed main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	int ls=0;
	for(int i=1;i<=maxn-10;i++)
	{
		
		if(vis[i]) continue;
		int cnt=i;
		bool pd=0;
		while(cnt)
		{
			if(cnt%10==7)
			{
				pd=1;
				break;	
			}
			cnt/=10;
		}
		if(pd)
		{
			for(int j=1;j*i<=maxn-10;j++)
			{
				vis[i*j]=1;
			}
			continue;
		}
		a[ls]=i;
		ls=i;
		
		
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
		cout<<a[x]<<endl;
		
	}
	return 0;
 } 