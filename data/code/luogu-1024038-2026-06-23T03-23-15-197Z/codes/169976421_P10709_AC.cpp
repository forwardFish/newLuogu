#include<bits/stdc++.h>
using namespace std;
int cmp(int a,int b)
{
	return a>b;
}
int main()
{
	int n;
	cin>>n;
	
	int a[n ];
	for(int i=0;i<n;i++)
	{
		cin>>a[i];
	}
	sort(a,a+n,cmp);
	long long map=0;
	for(int i=0;i<(n+1)/2;i++)
	{
		if(a[i]>=0)
		{
			map+=a[i];
		}
	}
	cout<<map;
	return 0;
}