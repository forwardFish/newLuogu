#include<bits/stdc++.h>
using namespace std;
int m[101][101];
int main()
{
	double a,b,c,d;
	cin>>a>>b>>c>>d;
	printf("%0.1lf\n%0.1lf",a*b+c*d,(a*b+c*d)/(b+d));
	return 0;
}