#include<bits/stdc++.h>
using namespace std;
int main()
{
	int a,b,map=0;
	cin>>a;
	for(int i=1;i<=a;i++)
	{
		cin>>b;
		map+=b;
	}
	if(a%2==0)
	{
		cout<<"Bob";
	}
	else
	{
		cout<<"Alice";
	}
	return 0;
 } 