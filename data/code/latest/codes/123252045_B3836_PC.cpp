#include<bits/stdc++.h>
using namespace std;
int main() 
{
	int x,y,z,n,m,k,map=0;
	cin>>x>>y>>z>>n>>m;
	for(int i=0;i<=m/5;i++)
	{
		for(int j=0;j<=m/3;j++)
		{
			k=m-i-j;
			if(i*x+j*y+k*1.0/z==n)
			{
				map++;
			}
		} 
	} 
	cout<<map;
	return 0; 
}