#include<bits/stdc++.h>
using namespace std;
set<string> t;
int main()
{
	int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		string s;
		cin>>s;
		t.insert(s);
	}
	cout<<t.size();
	return 0;
}