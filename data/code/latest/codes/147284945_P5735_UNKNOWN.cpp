#include<bits/stdc++.h>
using namespace std;
doubledis(doublea1,doubleb1,doublea2,doubleb2)
{
	returnsqrt(abs((a1-a2)*(a1-a2))+abs((b1-b2)*(b1-b2)));
}
intmain()
{
	double a1,b1,a2,b2,a3,b3,c;
	cin>>a1>>b1>>a2>>b2>>a3>>b3;
	double dis1=dis(a1,b1,a2,b2),dis2=dis(a2,b2,a3,b3),dis3=dis(a3,b3,a1,b1);
	c=dis1+dis2+dis3;
	printf("%.2f",c);
	return 0;
}