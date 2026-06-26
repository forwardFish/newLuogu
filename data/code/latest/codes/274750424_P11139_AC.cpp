#include<bits/stdc++.h>
#define int long long 
#define endl "\n"
using namespace std;
map<int,int> t;
queue<int> q;
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	int Q;
	cin>>Q;
	while(Q--)
	{
		int opt,x,y;
		cin>>opt;
		if(opt==1)
		{
			cin>>x>>y;
			t[x]+=y;
			q.push(x);
		}
		else if(opt==2)
		{
			cin>>x>>y;
			t[x]=max(t[x]-y,0ll);
		}
		else if(opt==3)
		{
			while(!q.empty())
			{
				if(t[q.front()]>1) t[q.front()]=1;
				q.pop();
			}
		}
		else
		{
			cin>>x;
			cout<<t[x]<<endl;
		}
	}
	return 0;
 } 