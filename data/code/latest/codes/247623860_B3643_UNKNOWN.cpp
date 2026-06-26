#include<bits/stdc++.h>
using namespace std;
const int maxn=1e3+5; 
vector<int> g[maxn];
int aa[maxn][maxn];
int main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	int n,m;
	cin>>n>>m;
	for(int i=1;i<=n;i++)
	{
		int u,v;
		cin>>u>>v;
		g[u].push_back(v);
		g[v].push_back(u);
		aa[u][v]=1;
		aa[v][u]=1;
	}
	for(int i=1;i<=n;i++)
	{
		for(int j=1;j<=n;j++)
		{
			cout<<aa[i][j]<<" ";
		}
		cout<<'\n';
	}
	for(int i=1;i<=n;i++)
	{
		cout<<g[i].size()<<" ";
		for(int j=0;j<g[i].size();j++)
		{
			cout<<g[i][j]<<" ";
		}
		cout<<"\n";
	}
	return 0;
}