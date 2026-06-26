#include<bits/stdc++.h>
using namespace std;
const int maxn=1e2+5;
int g[maxn];
int n;
bool pd(int x)
{
	bool f=0;
	for(int i=1;i<n;i++)
	{
		if(x==i)
		{
			continue;
		}
		int k=i;
		bool f1=0;
		for(int j=0;j<=100;j++)
		{
			k=g[k];
			if(k==x)
			{
				f1=1;
			}
		}
		if(!f1)
		{
			f=1;

		}
	}
	return f;
}
int main()
{
	ios::sync_with_stdio(false);
	cin.tie(nullptr);
	cin>>n;
	for(int i=1;i<n;i++)
	{
		int a,b;
		cin>>a>>b;
		g[a]=b;
	}
	for(int i=1;i<n;i++)
	{
		if(pd(i)==0)
		{
			cout<<i;
			return 0;
		}
	}
	cout<<-1;
	return 0;
 }
