#include<bits/stdc++.h>
using namespace std;
int main()
{
	int n;
	cin>>n;
	Bigint a[5005];
	a[1]=Bigint(1);
	a[2]=Bigint(2);
	for(int i=3;i<=n;i++)
	{
		a[i]=a[i-2]+a[i-1];
	}
	cout<<a[n];
	return 0; 
} 