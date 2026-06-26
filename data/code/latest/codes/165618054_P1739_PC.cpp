#include<bits/stdc++.h>
using namespace std;
int main()
{
	string a;
	cin>>a;
	int z=0,y=0;
	for(int i=0;i<a.size();i++)
	{
		if(a[i]=='(')
		{
			z++;
		}
		else if(a[i]==')')
		{
			y++;
		}
	}
	if(z==y)
	{
		cout<<"YES";
	}
	else
	{
		cout<<"NO";
	}
}