#include<bits/stdc++.h>
using namespace std;
long long gcd(long long a,long long b)
{
    while (b!=0)
	{
        long long t=b;
        b=a%b;
        a=t;
    }
    return a;
}
int main()
{
    ios::sync_with_stdio(false);
    cin.tie(0);
    int t;
    cin>>t;
    while (t--)
	{
        long long a,b,c;
        cin>>a>>b>>c;
        long long g=gcd(a,b);
        long long a1=a/g;
        long long b1=b / g;
        long long k=(c+min(a1,b1)-1)/min(a1,b1);
        long long x=a1*k;
        long long y=b1*k;
        cout<<x+y<<'\n';
    }
    return 0;
}
