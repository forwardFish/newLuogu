#include<bits/stdc++.h>
#define int long long
#define endl "\n"
using namespace std;
struct node
{
	int l,r;
	bool operator < (const node a) const 
	{
		return r<a.l;
	}
};
set<node> s;
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	int t;
	cin>>t;;
	while(t--)
	{
		char opt;
		cin>>opt;
		if(opt=='A')
		{
			int l,r,cnt=0;cin>>l>>r;
			node a=(node){l,r}; 
			auto it=s.find(a);
			while(it!=s.end())
			{
				cnt++;
				s.erase(it);
				it=s.find(a);
			}
			s.insert(a);
			cout<<cnt<<endl;
		}
		else
		{
			cout<<s.size()<<endl;
		}
		
	}
	return 0;
}
