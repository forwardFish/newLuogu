#include<bits/stdc++.h>
using namespace std;
int main()
{
	int n,a,b,c,e;
	cin>>n>>a>>b>>c;
	int d=(4-n%4);
	if(d==1) e=min(a,min(b+c,c*3));
	if(d==2) e=min(b,min(a*2,c*2));
	if(d==3) e=min(a*3,min(a+b,c));
	if(d==4) e=0;
	cout<<e;
	return 0;
}