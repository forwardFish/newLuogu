#include<bits/stdc++.h>
using namespace std;
int main()
{
	int n,m;
	cin>>n>>m;
	int c=n%m;
	int l=n/m;
	for(int i=1;i<=c;i++)
	{
		cout<<l+1<<" ";
	}
	for(int i=c+1;i<=m;i++)
	{
		cout<<l<<" ";
	}
	return 0;
}