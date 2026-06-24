#include<bits/stdc++.h>
using namespace std;
const int maxn=1e3+5; 
map<string,string> t;
int main()
{
	int n,m;
	cin>>n>>m;
	for(int i=1;i<=m;i++)
	{
		string a,b;
		cin>>a>>b;
		t[a]=b;
	}
	while(n--)
	{
		string s;
		cin>>s;
		cout<<t[s]<<" ";
	}
	return 0;
}
