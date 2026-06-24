#include<bits/stdc++.h>
using namespace std;
int main()
{
	int a;
	cin>>a;
	double b=0,c=1.0;
	for(;b<=a;c++)
	{
		b+=1/c;
	}
	cout<<c-1;
	return 0;
}