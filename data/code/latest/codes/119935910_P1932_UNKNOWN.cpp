#include<bits/stdc++.h>
using namespace std;
int main()
{
	int a,b;
	cin>>a>>b;
	if(a>b)
	{
		cout<<a+b<<endl<<a-b<<endl<<a*b<<endl<<a/b<<endl<<a%b;
	}
	else
	{
		cout<<a+b<<endl<<b-a<<endl<<a*b<<endl<<a/b<<endl<<a%b;		
	}
	return 0;
}