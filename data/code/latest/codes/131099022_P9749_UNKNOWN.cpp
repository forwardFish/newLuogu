#include<bits/stdc++.h>
using namespace std;
int n=0,d=0,mx[10001],v[10001];
int cde(int a,int b)
{
	int x=0;
	if(a==b) return v[a];
	else
	{
		for(int i=a;i<b;i++)
		{
			x=x+v[i];
		}
	}
	return x;
}
int main()
{
	int oil=0,mon=0,szz=0;
	cin>>n>>d;
	for(int i=0;i<n-1;i++)
	{
		cin>>v[i];
		szz=szz+v[i];
	}
	for(int i=0;i<n;i++) cin>>mx[i];
	int tmin=mx[0],tway=0,bmin=0;
	for(int i=1;i<n;i++)
	{
		if(tmin>mx[i])
		{
			tmin=mx[i];
			tway=i;
		}
	}
	if(tmin==mx[0])
	{
		mon=ceil(szz/d)*mx[0];
		cout<<mon;
	}
	else
	{
		int x=0,xmon=mx[0],lesskm=0;
		for(int i=1;i<n;i++)
		{
			if(mx[i]<=xmon)
			{
				lesskm=lesskm+cde(x,i)%d;
				mon=mon+(ceil((cde(x,i)-lesskm)/d)+1)*xmon;
				xmon=mx[i];
				x=i;
				lesskm==0;
			}
		}
	}
	cout<<mon;
	return 0;
} 