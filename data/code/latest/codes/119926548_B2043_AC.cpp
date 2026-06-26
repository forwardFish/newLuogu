#include<bits/stdc++.h>
using namespace std;
int main()
{
	int a;
	cin>>a;
	if(a%3==0&&a%5==0&&a%7==0)
	{
		cout<<"3 5 7";
		return 0;
	}
	if(a%3==0&&a%5==0)
	{
		cout<<"3 5";
		return 0;
	}
	if(a%3==0&&a%7==0)
	{
		cout<<"3 7";
		return 0;
	}
	if(a%5==0&&a%7==0)
	{
		cout<<"5 7";
		return 0;
	}
	return 0;
}
