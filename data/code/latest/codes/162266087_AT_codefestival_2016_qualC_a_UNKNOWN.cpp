#include<bits/stdc++.h>
using namespace std;
int main()
{
	int a=0,b=0;
	string c;
	cin>>c;
	for(int i=0;i<c.size();i++)
	{
		if(c[i]=='C')
		{
			a=i;
		}
		if(c[i]=='F')
		{
			b=i;
		}
		if(a!=0 && b!=0)
		{
			break;
		}
	}
	if(a<b)
	{
		cout<<"Yes";
	}
	else
	{
		cout<<"No";
	}
	return 0; 
 } 