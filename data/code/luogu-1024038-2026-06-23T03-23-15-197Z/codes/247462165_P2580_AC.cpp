#include<bits/stdc++.h>
#define int unsigned long long 
using namespace std;
const int maxn=1e6+5;
map<string,int> t;
signed main()
{
	int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		string s;
		cin>>s;
		t[s]++;
	}
	int q;
	cin>>q; 
	while(q--)
	{
		string s;
		cin>>s;
		if(t[s]==0)
		{
			cout<<"WRONG\n";
		}
		else if(t[s]==1)
		{
			cout<<"OK\n";
			t[s]++; 
			
		}
		else if(t[s]>=2)
		{
			cout<<"REPEAT\n";
			t[s]++;
		}
	}
	return 0;
}
