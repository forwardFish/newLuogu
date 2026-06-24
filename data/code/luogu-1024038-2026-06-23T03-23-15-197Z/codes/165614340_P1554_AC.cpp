#include<bits/stdc++.h>
using namespace std;
int a[10],n,m;
int main()
{
	cin>>n>>m;
	for(int i=n;i<=m;i++)
	{
		for(int j=i;j;j/=10)
		{
			a[j%10]++;
		}
	} 
	for(int i=0;i<=9;i++)
	{
		cout<<a[i]<<" ";
	}
	return 0;
}
