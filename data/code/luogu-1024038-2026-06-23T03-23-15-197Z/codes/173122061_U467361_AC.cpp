#include<bits/stdc++.h>
using namespace std;
string a;
int main()
{
	cin>>a;
	int len=a.size();
	int i=0;
	int s=len;
	int c=len;
	int l=0,r=c-1;
	if(len % 2 == 0)
	{
		while(s!=0)
		{
			cout<<a[l]<<a[r];
			l++;r--;
			s-=2;
		}
	}
	else
	{
		while(s!=1)
		{
			cout<<a[l]<<a[r];
			l++;r--;
			s-=2;
		}
		cout<<a[(c/2)];
	}
	return 0;
 }
