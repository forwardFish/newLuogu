#include<bits/stdc++.h>
#define int long long 
#define endl "\n"
using namespace std;
map<int,int> t;
queue<int> q;
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	int q;
	cin>>q;
	while(q--)
	{
		int opt,x,y;
		cin>>opt;
		if(opt==1)
		{
			cin>>x>>y;
			p[x]+=y;
			q.push(x);
		}
		else if(opt==2)
		{
			cin>>x>>y;
			p[x]=max(p[x]-y,0);
		}
		else if(opt==3)
		{
			while(!q.empty())
			{
				if(p[q.front()]>1) p[q.front()]=1;
				q.pop();
			}
		}
		else
		{
			cin>>x;
			cout<<p[x]<<endl;
		}
	}
	return 0;
 } 