#include<bits/stdc++.h>
using namespace std;
int cmp(int a,int b)
{
	return a>b;
}
int main()
{
	long long n,m;
	cin>>n>>m;
	int a[n];
	for(int i=0;i<n;i++)
	{
		cin>>a[i];
	}
	sort(a,a+n,cmp);
	long long map=0,t=0;
	for(int i=0;i<n;i++)
	{
		if(map>=m)
		{
			cout<<t;
			return 0;
		}
		map+=a[i];
		t++;
	}
	return 0;
 } 