#include<bits/stdc++.h>
using namespace std;
int x[5005],y[5005],m[5005];
int main()
{
	int n,s,a,b;
	cin>>n>>s>>a>>b;
	int h=a+b;
	for(int i=1;i<=n;i++)
	{
		cin>>x[i]>>y[i];
	}
	for(int i=1;i<=n;i++)
	{
		for(int j=s;j>=y[i];j--)
		{
			if(x[i]<=h)
			{
				m[j]=max(m[j-y[i]]+1,m[j]);	
			}
		}
	}
	cout<<m[s];
	return 0;
}