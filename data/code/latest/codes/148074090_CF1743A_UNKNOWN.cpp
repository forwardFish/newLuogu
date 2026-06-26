#include<bits/stdc++.h>
using namespace std;
int s()
{
	int n,map;
	cin>>n;
	for(int i=1;i<=n;i++) 
	{
		int a;
		cin>>a;
	}
	n=10-n;
	map=6*n*(n-1)/2;
	cout<<map<<endl;
}
int main()
{
	int t;
	cin>>t;
	while(t--)
	{
		s();
	}
	return 0;
}