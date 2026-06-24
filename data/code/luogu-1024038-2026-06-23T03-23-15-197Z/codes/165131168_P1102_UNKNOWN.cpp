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
		for(int j=0;j<n;j++)
		{
			if(i-j==c)
			{
				map++;
				continue;
			}
			else if(j-i==c)
			{
				map++;
				continue;
			}
		}
	}
	cout<<map/2;
	return 0;
}