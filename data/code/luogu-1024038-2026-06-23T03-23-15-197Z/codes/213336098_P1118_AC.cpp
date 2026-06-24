#include <bits/stdc++.h>
using namespace std;
int n,p;
int a[13];
int c[13][13];
bool b[13];
void dfs(int dep,int s)
{
	if(s>p)
		return;
	if(dep>n)
	{
		if(s==p)
		{
			cout<<a[1];
			for(int i=2;i<=n;i++)
				cout<<" "<<a[i];
			exit(0);
		}
		return;
	}
	for(int i=1;i<=n;i++)
	{
		if(b[i]==false)
		{
			b[i]=true;
			a[dep]=i;
			dfs(dep+1,s+i*c[n][dep]);
			b[i]=false;
		}
	}
}
int main()
{
	cin>>n>>p;
	c[1][1]=1;
	for(int i=2;i<=n;i++)
		for(int j=1;j<=i;j++)
			c[i][j]=c[i-1][j]+c[i-1][j-1];
	dfs(1,0);
	return 0;
}