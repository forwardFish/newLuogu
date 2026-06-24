#include<bits/stdc++.h>
using namespace std;
int main()
{
	int a[10],map,c;
	map=0;
	for(int i=0;i<10;i++)
	{
		cin>>a[i];
	}
	cin>>c;
	for(int i=0;i<10;i++)
	{
		if(c+30>=a[i])
		{
			map++;
		}
	}
	cout<<map;
	return 0;
}