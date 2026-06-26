#include<bits/stdc++.h>
using namespace std;
int a[105],b[105];
int t[105];
bool pd=false;
int main()
{
	int n,m;
	cin>>n>>m;
	for(int i=0;i<m;i++)
	{
		cin>>a[i]>>b[i];
		for(int j=a[i];j<=b[i];j++)
		{
			t[j-1]++;
		}
	}
	for(int i=0;i<n;i++)
	{
		if(t[i]==1)
		{
			pd=true;
		}
		else
		{
			cout<<i+1<<" "<<t[i];
			return 0;
		}
	}
	if(pd==true)
	{
		cout<<"OK";
	}
	return 0;
}