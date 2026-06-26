#include<bits/stdc++.h>
using namespace std;
const int maxn=1e2+5;
bool vis[maxn];
vector<int> g[maxn];
stack<int> ans;
void dfs(int x)
{
	for(auto i:g[x])
	{
		if(vis[i]==0)
		{
			dfs(i);
		}
	}
	vis[x]=1;
	ans.push(x);
}
int main()
{
	int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		int a;
		while(cin>>a)
		{
			if(a==0)
			{
				break;
			}
			g[i].push_back(a);
		}
	} 
	for(int i=1;i<=n;i++)
	{
		if(vis[i]==0)
		{
			dfs(i);
		}
	}
	while(!ans.empty())
	{
		cout<<ans.top()<<" ";
		ans.pop();
	}
	return 0;
}
