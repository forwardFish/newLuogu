#include<bits/stdc++.h>
using namespace std;
int a[2000001],b;
double x,y;
int main()
{
	cin>>b;
	for(int i=1;i<=b;i++)
	{
		cin>>x>>y;
		for(int j=1;j<=y;++j)
		{
			if(a[int(j*x)]==0)
			{
				a[int(j*x)]=1;
			}
			else
			{
				a[int(j*x)]=0;
			}
		}
	}
	for(int i=1;i++)
	{
		if(a[i]==1)
		{
			cout<<i;
			break;
		}
	}
	return 0;
} 