#include<bits/stdc++.h>
using namespace std;
int main()
{
	int a;
	unsigned long long map=2;
	cin>>a;
	for(int i=0;i<a-1;i++)
	{
		map*=2;
	}
	cout<<map;
	return 0;
}