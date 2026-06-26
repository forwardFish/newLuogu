#include<bits/stdc++.h>
using namespace std;
int main()
{
	int ans=0;
	int a,b,c,d,e;
	cin>>a>>b>>c>>d>>e;
	ans=ans+a%3;
	e=e+a/3;
	b=b+a/3;
	a/=3;
	ans+=b%3;
	a+=b/3;
	c+=b/3;
	b/=3;
	ans+=c%3;
	b+=c/3;
	d+=c/3;
	c/=3;
	ans+=d%3;
	c+=d/3;
	e+=d/3;
	d/=3;
	ans+=e%3;
	d+=e/3;
	a+=e/3;
	e/=3;
	cout<<a<<" "<<b<<" "<<c<<" "<<d<<" "<<e<<endl<<ans; 
 }
