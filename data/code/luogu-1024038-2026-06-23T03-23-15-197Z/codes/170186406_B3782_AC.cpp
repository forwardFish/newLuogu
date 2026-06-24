#include<bits/stdc++.h>
using namespace std;
int main()
{
	vector<int>p[2010];
	bool vis[2010];
	int n,m;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		cin >> m;
		if(m)
		{
			for(int j=1;j<=m;j++)
			{
				int x;
				cin >> x;
				vis[x]=1;
				p[i].push_back(x);
			}
		}
		else
		{
			int x;
			cin>>x;
			if(x>0)vis[x]=1;
			p[i].push_back(x);
		}
	}
	int s;
	for(int i=1;i<=n;i++)if(!vis[i])s=i;
	while(1){
		if(s==-1)
		{
			return 0;
		}
		int siz=p[s].size();
		cout<<s<<" ";
		if(p[s][siz-1]==-1)
		{
			return 0;
		}
		for(int i=0;i<siz;i++)
		{
			cout<<p[s][i]<<" ";
		}
		s=p[p[s][siz-1]][0];
	}
	return 0;
}