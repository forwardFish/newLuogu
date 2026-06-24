#include<bits/stdc++.h>
using namespace std;
int main()
{
	char a[1001];
	int n,map=1;
	cin>>n>>a;
	for(int i=1;i<=strlen(a);i++)
	{
		cin>>a[i];
		if(a[i]==a[i-1])
		{
			map++;
		}
		else map=1;
		if(map==n)
		{
			cout<<a[i];
			return 0;
		}
	}
	cout<<"No";
	return 0;
}