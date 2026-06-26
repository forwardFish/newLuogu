#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=10;
const int maxm=30;
bool pd[maxm][maxm];bool vis[maxn*maxn];
int val[maxm][maxm];
int p[maxn];
signed main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	int n,m;
	cin>>n>>m;
	for(int i=1;i<=m;i++)
	{
		int u,v,w;
		cin>>u>>v>>w;
		pd[u][v]=1;pd[v][u]=1;
		val[u][v]=w;val[v][u]=w;
	}
	for(int i=1;i<=n;i++)
	{
		p[i]=i;
	}
	int minn=LLONG_MAX;
	while(next_permutation(p+1,p+n+1))
	{
		memset(vis,0,sizeof(vis));
		int ans=0;
		for(int i=1;i<=n;i++)
		{
			int cnt=0,s=0;
			for(int j=1;j<=n;j++)
			{
				if(pd[p[i]][j] && !vis[j])
				{
					cnt++;
					s+=val[p[i]][j];
				}
			}
			ans+=cnt*s;
			vis[p[i]]=1;
		}
		minn=min(ans,minn);
	}
	cout<<minn;
	return 0;
 }
