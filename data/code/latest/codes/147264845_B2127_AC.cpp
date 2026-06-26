#include<bits/stdc++.h>
using namespace std;
int a(int n)
{
	int map=0;
	for(int i=1;i<=n;i++)
	{
		if(n%i==0)
		{
			if(i<n)
			{
				map+=i;
			}
		}
	}
	if(map==n)
	{
		return 1;
	}
	return 0;
}
int main()
{
	int n;
	cin>>n;
	for(int i=2;i<=n;i++)
	{	
		if(a(i)==1)
		{
			cout<<i<<endl;
		}	
	}
	return 0;
}