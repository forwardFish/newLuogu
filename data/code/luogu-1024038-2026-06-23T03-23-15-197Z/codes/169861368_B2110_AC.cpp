#include<bits/stdc++.h>
using namespace std;
char zm[26]={'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'};
int main()
{
	string a;
	cin>>a;
	int sl[26]={0};
	for(int i=0;i<a.size();i++)
	{
		for(int j=0;j<26;j++)
		{
			if(a[i]==zm[j])
			{
				sl[int(zm[j]-'a')]++;
			}
		}
	}
//	for(int i=0;i<26;i++)
//	{
//		cout<<sl[i];
//	}
	char zx[26];
	for(int i=0;i<26;i++)
	{
		if(sl[i]==1)
		{
			zx[i]=zm[i];
		}
	}
	for(int i=0;i<a.size();i++)
	{
		for(int j=0;j<26;j++)
		{
			if(a[i]==zx[j])
			{
				cout<<a[i];
				return 0;
			}
		}
	}
	cout<<"no";
	return 0;
 } 