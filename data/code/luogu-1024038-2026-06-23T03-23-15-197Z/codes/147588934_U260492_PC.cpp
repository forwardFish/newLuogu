#include<bits/stdc++.h>
using namespace std;
int main()
{
	int a[51]={1,2};
	int b;
	cin>>b;
	for(int i=0;i<b;i++)
	{
		a[i+2]=a[i]+a[i+1];
	}
	cout<<a[b-1];
	return 0;
 } 