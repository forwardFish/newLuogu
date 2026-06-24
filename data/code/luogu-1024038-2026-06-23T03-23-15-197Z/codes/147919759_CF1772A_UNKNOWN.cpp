#include<bits/stdc++.h>
using namespace std;
int main()
{
	int t;
	cin>>t;
	for(int i=0;i<t;i++)
	{
		string a;
		cin>>a;
		cout<<a[0]-'0'+a[2]-'0'<<endl;
	}
	
	return 0;
}