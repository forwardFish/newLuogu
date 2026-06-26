#include<bits/stdc++.h>
using namespace std;
int a[310][310],b[310],n,x;
int main()
{
	scanf("%d",&n);
	for(int i=1;i<=n;i++)
	{
		scanf("%d",&x);
		b[i]=b[i-1]+x;
	}
	memset(a,127/3,sizeof(a));
	for(int i=1;i<=n;i++)
	{
		a[i][i]=0;
	}
	for(int i=n-1;i>=1;i--)
	{
		for(int j=i+1;j<=n;j++)
		{
			for(int z=i;z<=j-1;z++)
			{
				a[i][j]=min(a[i][j],a[i][z]+a[z+1][j]+b[j]-b[i-1]);
			 } 
		}
	}
	printf("%d",a[1][n]); 
	return 0;
 } 