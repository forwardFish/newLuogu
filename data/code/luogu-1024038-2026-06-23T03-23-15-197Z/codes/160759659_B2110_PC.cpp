#include<bits/stdc++.h>
using namespace std;
map<char ,int> a;
int main()
{
	string b;
	cin>>b;
	char c[b.size()];
	for(int i=0;i<b.size();i++)
	{
		a[b[i]]++;
	}
	for(int i=0;i<b.size();i++)
	{
		if(a[b[i]]==1)
		{
			c[i]=b[i];
		}
	}
	for(int i=0;i<b.size();i++)
	{
		for(int j=0;j<b.size();j++)
		{
			if(c[j]==b[i])
			{
				cout<<b[i];
				return 0;
			}
		}
	 } 
	 cout<<"no";
	return 0;
 } 