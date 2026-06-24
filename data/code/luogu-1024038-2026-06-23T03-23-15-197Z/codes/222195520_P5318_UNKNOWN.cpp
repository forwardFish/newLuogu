#include<bits/stdc++.h>
using namespace std;
const int maxn=1e5+5;

bool bvis[maxn],dvis[maxn];

vector<int> g[maxn];
void dfs(int x)
{
	if(dvis[x])
	{
		return;
	}
	dvis[x]=1;
	cout<<x<<" ";
	for(int v:g[x])
	{
		dfs(v);
	}
}
int main()
{
	ios::sync_with_stdio(false);
	cin.tie(nullptr);
	int n,m;
	cin>>n>>m;
	for(int i=1;i<=m;i++)
	{
		int u,v;
		cin>>u>>v;
		g[u].push_back(v);
		
	}
	dfs(1);cout<<endl;
	queue<int> q;
	q.push(1);
	while(!q.empty())
	{
		int x=q.front();
		q.pop();
		if(!bvis[x])
		{
			bvis[x]=1;
			cout<<x<<" ";
			for(int v:g[x])
			{
				q.push(v);
			}
		}
		
	}
	return 0;
} 