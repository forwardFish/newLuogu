#include<bits/stdc++.h>
using namespace std;
int main()
{
	int n,a,b;
	cin>>n>>a>>b;
	int c[n];
	int map=0;
	for(int i=0;i<n;i++)
	{
		cin>>c[i];
		map+=min(c[i]*a,b);
	}
	cout<<map;
	return 0;
 } 