#include<bits/stdc++.h>
using namespace std;
bool zs(int a)
{
	if(a==0 || a==1) return 0;
	else if(a==2) return 1;
	for(int i=2;i*i<=a;i++)
	{
		if(a%i==0)
		{
			return 0;
		}
	}
	return 1;
}
int gcd(int a,int b)
{
	if(b==0)
	{
		return a;
	}
	return gcd(b,a%b);
}
int lcm(int a,int b)
{
	return a/gcd(a,b)*b;
}
int main()
{
	int a;
//	cin>>a;
//	if(zs(a)==1)
//	{
//		cout<<"质数"<<endl;
//	}
//	else
//	{
//		cout<<"不是质数"<<endl;
//	}
	int b,c;
	cin>>b>>c;
	cout<<gcd(b,c)<<" "<<lcm(b,c);
	return 0;
} 