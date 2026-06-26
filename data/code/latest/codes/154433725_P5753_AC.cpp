#include<bits/stdc++.h>
using namespace std;
double a,b;
int main()
{
	cin>>a>>b;     
	if(b>=a)
	{
		cout<<0;
		return 0;
	}
	double map=a/b;
	if(int(map)==map && int(map)%2!=0)
	{
		cout<<0;
		return 0;
	}
	if(b==1)
	{
		cout<<a/(2*b);
		return 0;
	}
	cout<<int(a/(2*b)+0.5);
	return 0;
}