#include<bits/stdc++.h>
using namespace std;
int main()
{
	int n,m,a,b,c,d;
    cin>>n>>m;    
    a=m;b=n;c=m*n;
    while(a!=0 && b!=0)
	{
        a--;b--;c+=a*b;
    }
    d=(m+1)*(n+1)*m*n/4-c;
    cout<<c<<" "<<d;
}