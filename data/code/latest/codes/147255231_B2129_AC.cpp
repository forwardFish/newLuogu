#include<bits/stdc++.h>
using namespace std;
double d(double a,double b,double c)
{
	double m;
	m=max(a,max(b,c))/(max(a+b,max(b,c))*max(a,max(b,b+c)));
	return m;
}
int main()
{
	int a,b,c;
	cin>>a>>b>>c;
	cout<<fixed<<setprecision(3)<<d(a,b,c); 
	return 0;
 } 