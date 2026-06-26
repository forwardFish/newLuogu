#include<bits/stdc++.h>
using namespace std;
int ss(int a)
{
	for(int i=2;i<=sqrt(a);i++)
	{
		if(a%i==0)
		{
			return 0;
		}
	} 
	return 1;
}
int main()
{
	int x,y,map=0;
	cin>>x>>y;
	for(int i=x;i<=y;i++)
	{
		if(ss(i)==1)
		{
			map++;
		}
	}
	cout<<map;
	return 0;
}