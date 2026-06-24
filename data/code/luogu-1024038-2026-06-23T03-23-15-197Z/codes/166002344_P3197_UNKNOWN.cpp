#include<bits/stdc++.h>
using namespace std;
long long p=0;
long long q(long long x,long long y)
{
    if(y==0)
    {
        return 1;
    }
    else
    {
        long long d=q(x,y/2);
        if(y%2==0)
        {
            return ((d%p)*(d%p))%p;
        }
        else if(y%2==1)
        {
            return ((d%p)*(d%p)*(x%p))%p;
        }
    }
}
int main()
{
    long long m=0,n=0;
    cin>>m>>n;
    printf("%lld",(q(m,n)-(m*q(m-1,n-1))%100003+100003)%100003);
    return 0;
}