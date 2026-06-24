#include<bits/stdc++.h>
using namespace std;
bool ss(int x)
{
	if(x==0 || x==1)
	{
		return 0;
	}
	for(int i=2;i<=sqrt(x);i++)
	{
		if(x%i==0)
		{
			return 0;
		}
	}
	return 1;
}
int main()
{
	int n,m;
	cin>>n>>m;
	while(n--)
	{
		int l,r;
		int map=0;
		cin>>l>>r;
		if(l<1 || r>m)
		{
			cout<<"Crossing the line";
			continue;
		}
		for(int i=l;i<=r;i++)
		{
			if(ss(i)==1)
			{
				map++;
			}
		}
		cout<<map<<endl;
	}
	return 0;
 } 