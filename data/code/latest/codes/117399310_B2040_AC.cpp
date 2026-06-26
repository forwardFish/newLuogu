#include<bits/stdc++.h>
using namespace std;
int main()
{
	int a;
	cin>>a;
	if(a<10)
	{
		cout<<0;
	}
	else
	{
		if(a/10<10)
		{
			cout<<1;
		}
		else
		{
			cout<<0;
		}		
	}
	return 0;
}