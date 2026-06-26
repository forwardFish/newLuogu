#include<bits/stdc++.h>
using namespace std;
int a,ans=8;char s;
int main()
{
    cin>>a>>s;
    if(a>1000)
    {
        a=a-1000;
        ans=ans+(a/500)*4;
        if(a%500!=0) 
            ans=ans+4;
    }
    if(s=='y') 
        ans=ans+5;
    cout<<ans;
    return 0;
}