#include<bits/stdc++.h>
using namespace std;
map<int,int> b;
int main()
{
	int n,c;
	cin>>n>>c;
	int a[n];
	for(int i=0;i<n;i++)
	{
		cin>>a[i];
		b[a[i]]++;
	}
	int map=0;
	for(int i=0;i<n;i++)
	{
		map+=b[a[i]+c];
	}
	cout<<map;
	return 0;
}