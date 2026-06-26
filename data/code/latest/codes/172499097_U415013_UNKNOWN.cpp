#include<bits/stdc++.h>
using namespace std;
int main()
{
	int n;
	cin>>n;
	int j,o;
	for(int i=1;i<=n;i++)
	{
		int x;
		cin>>x;
		if(x % 2 == 0)
		{
			o++;
		}
		else 
		{
			j++;
		}
	}
	while(j<o)
	{
		j-=2;
		o++;
	}
	if(j>o+1)
	{
		j=o+1;
	}
	cout<<o+j; 
	return 0;
 } 