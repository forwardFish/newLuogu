#include<bits/stdc++.h>
using namespace std;
int main()
{
	int n,m;
	cin>>n>>m;
	char a[n][m];
	for(int i=0;i<n;i++)
	{
		for(int j=0;j<n;j++)
		{
			cin>>a[i][j];
		}
	}
	int map=0;
	for(int i=1;i<n;i++)
	{
		for(int j=1;j<n;j++)
		{
			if(a[i][j]=='0')
			{
				if(a[i+1][j]=='*')
				{
					if(a[i-1][j]=='*')
					{
						if(a[i][j+1]=='*')
						{
							if(a[i][j-1]=='*')
							{
								map++;
							}
						}
					}
				}
			}
		}
	}
	cout<<map;
	return 0;
}