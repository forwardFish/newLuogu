#include<bits/stdc++.h>
using namespace std;
int main()
{
	int a,b,c,d;
	cin>>a>>b>>c>>d;
	int zj,zj1;
	zj=a*60+b;
	zj1=c*60+d;
	cout<<(zj1-zj)/60<<" "<<(zj1-zj)%60;
	return 0;
}