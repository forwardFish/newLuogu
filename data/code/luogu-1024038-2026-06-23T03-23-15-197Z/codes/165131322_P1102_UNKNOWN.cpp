#include<bits/stdc++.h>
using namespace std;
int main()
{
	int n,c;
	cin>>n>>c;
	int a[n];
	for(int i=0;i<n;i++)
	{
		cin>>a[i];
	}
	int map=0;
	for(int i=0;i<n;i++)
	{
		for(int j=i;j<n;j++)
		{
			if(i-j==c)
			{
				map++;
			}
			else if(j-i==c)
			{
				map++;
			}
		}
	}
	cout<<map;
	return 0;
}