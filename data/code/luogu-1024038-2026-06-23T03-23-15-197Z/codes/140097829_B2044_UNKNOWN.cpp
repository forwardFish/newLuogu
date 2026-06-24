#include<bits/stdc++.h>
using namespace std;
int main()
{
	int a,b,c;
	cin>>a>>b>>c;
	if(a<60 && b>=60 && c>=60)
	{
		cout<<"0";
	}
	else if(a>=60 && b<60 && c>=60)
	{
		cout<<"0";
	}
	else if(a>=60 && b>=60 && c<60)
	{
		cout<<"0";
	}
	else
	{
		cout<<"1";
	}
	return 0;
 } 