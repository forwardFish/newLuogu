#include<bits/stdc++.h>
using namespace std;
int a,n;
int b[1002010]={0},l=1002001;
int main()
{
	cin>>a>>n;
	for(int i=ceil(sqrt(a*1.0));i*i<=1002001;i++)
	{
		for(int j=1;j*i*i<=1002001;j++)
		{
			b[j*i*i]=j*i*i;
		}
	}
	for(int i=1002000;i>=1;i--)
	{
		if(b[i]==i) 
		{
			l=i;
		}
		else 
		{
			b[i]=l;
		}
	}
	while(n--)
	{
		int x;
		cin>>x;
		if(b[x]==x) 
		{
			puts("lucky");
		}
		else printf("%d\n",b[x]);
	}
	return 0;
}