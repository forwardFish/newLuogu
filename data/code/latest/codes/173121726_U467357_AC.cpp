#include<bits/stdc++.h>
using namespace std;
int main()
{
	char a,b,c,d,e,f;
	cin>>a>>b>>c>>d>>e>>f;
	if(b==d && d==f && a!=b && a!=c && a!=e && b!=c &&b!=e && c!=e)
	{
		cout<<"Yes"<<endl;
	}
	else
	{
		cout<<"No"<<endl;
	}
	return 0;
 } 