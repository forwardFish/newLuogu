#include<bits/stdc++.h>
using namespace std; 
int gcd(int a,int b)
{
    while(b!=0)
	{
        int d=b;
        b=a % b;
        a=d;
    }
    return a;
}
int main()
{
    int x,y,z;
    cin>>x>>y>>z;
    int a=gcd(x,y);
    int c=gcd(a,z);
    cout<<c;
    return 0;
}

