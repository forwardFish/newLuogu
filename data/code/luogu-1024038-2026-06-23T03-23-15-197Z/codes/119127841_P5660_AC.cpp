#include<bits/stdc++.h>
using namespace std;
int main()
{
	char a[8];
	int map=0;
	cin>>a;
	for(int i=0;i<8;i++)
	{
		if(a[i]=='1')
		{
			map++;
		}
	} 
	cout<<map;
	return 0;
} 