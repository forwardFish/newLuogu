#include<bits/stdc++.h>
using namespace std;
int a(int n)
{
	if(n%4!=0)
	{
		return 0;
	}
	else
	{
		if(n%100==0)
		{
			if(n%400==0)
			{
				return 1;
			}
			return 0;
		}
		return 1;
	}
}
int main()
{
	int a,b,map=0;
	cin>>a>>b;
	for(int i=a;i<=b;++i)
	{
		if(a(i))
		{
			map++;
		}
	} 
	cout<<map<<endl;
	for(int i=a;i<=b;++i)
	{
		if(a(i))
		{
			cout<<i<<" ";
		}
	} 
	return 0;
}