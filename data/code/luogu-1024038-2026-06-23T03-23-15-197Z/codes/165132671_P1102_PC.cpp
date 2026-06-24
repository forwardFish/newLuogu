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
			if((a[i]-a[j])==c)
			{
				map++;
			}
			else if((a[j]-a[i])==c)
			{
				map++;
			}
		}
	}
	cout<<map;
	return 0;
}