#include<bits/stdc++.h>
using namespace std;
double cc(double x,double y,double xx,double yy)
{
	return sqrt((x-xx)*(x-xx)+(y-yy)*(y-yy));
}
int main()
{
	double x1,y1,x2,y2,x3,y3;
	cin>>x1>>y1>>x2>>y2>>x3>>y3;
	double a=cc(x1,y1,x2,y2),b=cc(x1,y1,x3,y3),c=cc(x2,y2,x3,y3);
	double q=(a+b+c)/2;
	
	printf("%0.2lf",sqrt(q*(q-a)*(q-b)*(q-c)));

	return 0;
}
