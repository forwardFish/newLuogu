#include<bits/stdc++.h>
using namespace std;
double cc(double x,double y,double xx,double yy)
{
	return sqrt((x-xx)*(x-xx)+(y-yy)*(y-yy));
}
int main()
{
	double x1,y1,x2,y2;
	cin>>x1>>y1>>x2>>y2;
	cout<<cc(x1,y1,x2,y2);

	return 0;
}
