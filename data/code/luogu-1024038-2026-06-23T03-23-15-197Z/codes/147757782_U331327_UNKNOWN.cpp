#include<bits/stdc++.h>
using namespace std;
int main()
{
	int n;
	cin>>n;
	int a[n];
	int b[n];
	int c[31];
	c[0]=1;
	for(int i=1;i<=n;i++)
	{
		c[i]=b[i-1]*2;
	}
	for(int i=0;i<n;i++)
	{
		cin>>a[i];
	}
	for(int i=0;i<n;i++)
	{
		cin>>b[i];
	}
	for(int i=0;i<n;i++)
	{
		cout<<a[i]*c[i];
		cout<<endl;
	}
	return 0;
 } 