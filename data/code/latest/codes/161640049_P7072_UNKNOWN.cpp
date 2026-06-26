#include<bits/stdc++.h>
using namespace std;
int main()
{
	int a[605];
	int n,b;
	int a1;
	cin>>n>>b;
	for(int i=1;i<=n;i++)
	{
		cin>>a1;
		a[a1]++;
		int map=0;
		for(int j=600;j>=0;j--)
		{
			map+=a[j];
			if(map>=max(1,i*n/100))
			{
				cout<<j<<' ';
				break;
			}
		}
	}
	return 0;
 } 