#include<bits/stdc++.h>
using namespace std;
double a,b,c;
int main(){
	cin>>a;
	b=a/3.0+27+23;
	c=a/1.2;
	if(b==c) cout<<"All";
	if(b<c) cout<<"Bike";
	if(b>c) cout<<"Walk";
	return 0;
}