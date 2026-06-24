#include<bits/stdc++.h>
using namespace std;
int main()
{
	int a[3]={2,4,8};
	int map=0;
	string s;
	cin>>s;
	for(int i=0;i<s.size();i++)
	{
		if(s[i]-'0'==a[0] || s[i]-'0'==a[1] || s[i]-'0'==a[2])
		{
			map++;
		}
	}
	cout<<map;
}