#include<bits/stdc++.h>
using namespace std;
int main()
{
	int a;
	cin>>a;
	if(a<=100)
	{
		cout<<100;
	}
	else if(a>100 && a<=150)
	{
		cout<<150;
	}
	else if(a>150 && a<=300)
	{
		cout<<300;
	}
	else if(a>300 && a<=400)
	{
		cout<<400;
	}
	else
	{
		cout<<1000;
	}
	return 0;
}