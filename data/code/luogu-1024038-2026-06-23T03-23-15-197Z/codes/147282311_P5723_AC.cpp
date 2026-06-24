#include<bits/stdc++.h>
using namespace std;
int ss(int a)
{
	if(a==1)
	{
		return 0;
	}
	for(int i=2;i<=sqrt(a);i++)
	{
		if(a%i==0)
		{
			return 0;
		}
	} 
	return 1;
}
int main()
{
	int l,map=0,z=0;
	cin>>l;
	for(int i=1;i<=l;i++)
	{
		if(ss(i)==1)
		{
			if(l-map<i)
			{
				cout<<z;
				return 0;
			}
			if(l-map==i)
			{
				cout<<i<<endl;
				cout<<z+1;
				return 0;
			}
			map+=i;
			z++;
			cout<<i<<endl;
		}
	}
	cout<<z;
	return 0;
}