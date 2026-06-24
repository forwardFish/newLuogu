#include<bits/stdc++.h>
using namespace std;
int main()
{
	int n,map=0;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		for(int j=1;j<=n;j++)
		{
			for(int k=1;k<=n;k++)
			{
				if(i*i+j*j==k*k)
				{
					map++;
				}
			}
		}
	}
	cout<<map/2;
	return 0;
}