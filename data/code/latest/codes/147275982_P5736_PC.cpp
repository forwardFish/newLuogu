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
	int a;
	cin>>a;
	int b[a];
	for(int i=0;i<a;i++)
	{
		cin>>b[i];
	}
	for(int i=0;i<a;i++)
	{
		if(ss(b[i])==1)
		{
			cout<<b[i]<<" ";
		}
	}
	return 0;
} 