#include<bits/stdc++.h>
using namespace std;
int main()
{
	int a,x;
	cin>>a>>x;
	int b[a];
	for(int i=0;i<a;i++)
	{
		cin>>b[i];
	} 
	sort(b,b+a);
	cout<<b[x-1];
	return 0;
 } 