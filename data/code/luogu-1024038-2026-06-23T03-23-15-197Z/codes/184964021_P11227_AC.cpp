#include<bits/stdc++.h>
using namespace std;
set<string> s; 
int main()
{
	int n;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		string c;
		cin>>c;
		s.insert(c);
	}
	cout<<52-s.size();
	return 0;
}
