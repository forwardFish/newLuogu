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
int hw(int x)
{
	int t=0,m=0,a[15],b[15];
	while(x!=0)
	{
		t++;
		a[t]=x%10;
		x/=10;
	}
	for(int i=t;i>=1;i--)
	{
		m++;
		b[m]=a[i];
	}
	for(int i=1;i<=t;i++)
	{
		if(a[i]!=b[i])
		{
			return 0;
		}	
	}
	return 1;		
}
int main()
{
	int n,map=0;
	cin>>n;
	for(int i=11;i<=n;i++)
	{
		if(ss(i)==1&&hw(i)==1)
		{
			map++;
		}
	} 
	cout<<map;
	return 0;
}