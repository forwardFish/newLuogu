#include<bits/stdc++.h>
using namespace std;
int main()
{
	char s[100001],a[26]={};
	for(int i=0;i<strlen(s);i++)
	{
		a[s[i]-97]++;
	}
	for(int i=0;i<strlen(s);i++)
	{
		if(a[s[i]-97]==1)
		{
			cout<<s[i];	
			return 0;
		}
	}
	cout<<"no";
	return 0;
}