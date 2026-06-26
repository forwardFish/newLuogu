#include<bits/stdc++.h>
using namespace std;
int main()
{
	int a,b,c;
	cin>>a>>b>>c;
	
	int d[3]={a,b,c};
	sort(d,d+3);
	if(d[0]+d[1]>d[2])
	{
		cout<<"1";
	}
	else
	{
		cout<<"0";
	}
	return 0;
 } 