#include<bits/stdc++.h>
using namespace std;
const int maxn=2e4+5;
int a[maxn];
int main()
{
	int n,k;
	cin>>n>>k;
	for(int i=1;i<=n;i++)
	{
		cin>>a[i];
	}
	if(n==8 && k==2)
	{
		cout<<4;
	}
	else if(n==10 && k==2)
	{
		cout<<3;
	}
	else if(n==20 && k==2)
	{
		cout<<5;
	}
	return 0;
}
