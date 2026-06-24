#include<bits/stdc++.h>
using namespace std;
int ss(int a)
{
	if(a==1)
	{
		return 0;
	}
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
	int q;
	cin>>q;
	for(int i=0;i<q;i++)
	{
		int a;
		cin>>a;
		if(ss(a)==1)
		{
			cout<<"Yes";
		}
		else
		{
			cout<<"No";
		}
	}
	return 0;
}