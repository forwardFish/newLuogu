#include<bits/stdc++.h>
using namespace std;
#define m max 
int a1[21][21],b1[21][21];
long long s;
int main()
{
	int a,b;
	cin>>a>>b>>s;
	for(int i=a;i>=1;i--)
	{
		a1[i][i]=s%10;
		s/=10;
	}
	for(int i=2;i<=a;i++)
	{
		for(int j=i-1;j>=1;j--)
		{
			a1[j][i]=a1[j][i-1]*10+a1[i][i];
		}
	}
	for(int i=1;i<=a;i++)
	{
		a1[i][0]=a1[1][i];
	}
	for(int z=1;z<=b;z++)
	{
		for(int i=z+1;i<=a;i++)
		{
			for(int j=z;j<i;j++)
			{
				a1[i][z]=m(a1[i][z],a1[j][z-1]*a1[j+1][i]);
			}
		} 
	}
	cout<<a1[a][b];
	return 0;
} 