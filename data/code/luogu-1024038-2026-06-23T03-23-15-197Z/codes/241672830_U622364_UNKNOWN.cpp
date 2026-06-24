#include<bits/stdc++.h>
using namespace std;
int pd(string x,string y)
{
	int n=min(x.size(),y.size());
	for(int i=0;i<n;i++)
	{
		if(x[i]>y[i])
		{
			return 2;
		}
		else if(x[i]<y[i])
		{
			return 1;
		}
	}
	if(x.size()>y.size())
	{
		return 2;
	}
	else if(x.size()<y.size())
	{
		return 1;
	}
	else
	{
		return 0;
	}
}
int main()
{
	freopen("math.in","r",stdin);
	freopen("math.out","w",stdout);
	string a,b;
	cin>>a>>b;
	int x=pd(a,b);
	if(x==2)
	{
		cout<<a<<">"<<b;
	}
	else if(x==1)
	{
		cout<<a<<"<"<<b;
	}
	else
	{
		cout<<a<<"="<<b;
	}
	return 0;
	
}