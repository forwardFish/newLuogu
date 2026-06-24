#include<bits/stdc++.h>
using namespace std;
int main()
{
	int c[605]={0};
	int n,b;	
	int a;
	cin>>n>>b;
	for(int i=1;i<=n;i++)
	{
		cin>>a;
		c[a]++;
		int map=0;
		for(int j=600;j>=0;j--)
		{
			map+=c[j];
			if(map>=max(1,i*b/100))
			{
				cout<<j<<' ';
				break;
			}
		}
	}
	return 0;
 } 