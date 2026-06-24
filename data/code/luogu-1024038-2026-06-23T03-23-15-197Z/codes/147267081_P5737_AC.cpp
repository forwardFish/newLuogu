#include<bits/stdc++.h>
using namespace std;
int c(int n)
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
		if(c(i))
		{
			map++;
		}
	} 
	cout<<map<<endl;
	for(int i=a;i<=b;++i)
	{
		if(c(i))
		{
			cout<<i<<" ";
		}
	} 
	return 0;
}