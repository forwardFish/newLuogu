#include<bits/stdc++.h>
using namespace std;
int main()
{
    int a[4];  
    for (int i=1;i<=3;i++)
    {
        cin>>a[i];
    }
    sort(a+1,a+3+1);
    cout<<a[1]/__gcd(a[1],a[3])<<'/'<<a[3]/__gcd(a[1],a[3]);
    return 0;
}