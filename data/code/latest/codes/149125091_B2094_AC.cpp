#include<bits/stdc++.h>
using namespace std;
int main()
{
	int a[105],n,map=0;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i];
	}
	sort(a+1,a+n+1);
	for(int i=1;a[i]!=a[n];i++)
	{
		map+=a[i];
	}
	cout<<map;
	return 0;
}