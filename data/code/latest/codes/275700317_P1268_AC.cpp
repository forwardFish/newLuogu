#include<bits/stdc++.h>
using namespace std;
#define int long long
#define endl "\n"
const int maxn=35;
int t[maxn][maxn];
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		for(int j=i+1;j<=n;j++)
		{
			cin>>t[i][j];
			t[j][i]=t[i][j];
		}
	}
	int ans=0;
	int v=1;
	for(int u=1;u<=n;u++)
	{
		int l=INT_MAX;
		for(int x=1;x<u;x++)
		{
			l=min(l,(t[u][v]+t[u][x]-t[v][x])>>1);
		}
		if(l!=INT_MAX)
		{
			ans+=l;
		}
	}
	cout<<ans;
	return 0;
}
