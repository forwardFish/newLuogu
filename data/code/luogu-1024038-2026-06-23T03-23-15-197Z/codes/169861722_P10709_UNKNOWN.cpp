#include<bits/stdc++.h>
using namespace std;
int s(int x)
{
	if(x%2==1)
	{
		return x/2+1; 
	}
	else
	{
		return x/2;
	}
}
int cmp(int a,int b)
{
	return a>b;
}
int main()
{
	int a;
	cin>>a;
	int n[a];
	for(int i=0;i<a;i++)
	{
		cin>>n[i];
	}
	sort(n,n+a,cmp);
	long long map=0;
	for(int i=0;i<s(a);i++)
	{
		map+=n[i];
	}
	cout<<map;
	return 0;
 } 
 