#include<bits/stdc++.h>
using namespace std;
int a(int b,int c)
{
    if(b==0)return c;
    a(c%b,b);
}
int main()
{
    int x,y,q,map=0,k;
    cin>>x>>y;
    k=x*y;
    q=sqrt(k);
    for(int i=x;i<=q;i++)
    {
        if(k%i==0&&a(i,k/i)==x)map++;
    }
    cout<<map*2;
    return 0;
}