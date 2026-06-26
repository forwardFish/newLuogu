#include<bits/stdc++.h>
using namespace std;
int main()
{
	int a=0;b=0;
	string c;
	cin>>c;
	for(int i=0;i<n;i++)
	{
		if(c[i]=='C')
		{
			a++;
		}
		if(c[i]=='F')
		{
			b++;
		}
	}
	if(a+b>=2)
	{
		cout<<"Yes";
	}
	else
	{
		cout<<"No";
	}
	return 0; 
 } 