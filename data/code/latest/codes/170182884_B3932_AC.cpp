#include<bits/stdc++.h>
using namespace std;
int main()
{
	double a,b,c,d,e,x,y;
	cin>>a>>b>>c>>d>>e>>x>>y;
	double a1=a*x+b*y;
	double a2=c*y;
	double a3=d*y+e;
	double a4=max(a1,max(a2,a3));
	if(a4==a1) printf("1 %0.2lf",a1);
	if(a4==a2) printf("2 %0.2lf",a2);
	if(a4==a3) printf("3 %0.2lf",a3);
	return 0;
 } 