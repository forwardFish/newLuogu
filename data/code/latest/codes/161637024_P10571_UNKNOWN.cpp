#include<bits/stdc++.h>
using namespace std;
// 16 65536
int main()
{
	long long a[50]={2};
	int map=0;
	string s;
	cin>>s;
	for(int i=1;i<=40;i++)
	{
		a[i]=a[i-1]*2;
//		cout<<a[i]<<endl;
	}
	for(int i=0;i<s.size();i++)
	{
		if(s[i]-'0'==a[0] || s[i]-'0'==a[1] || s[i]-'0'==a[2])
		{
			map++;
		}
	}
	cout<<map;
}