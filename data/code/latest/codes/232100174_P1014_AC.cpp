#include<bits/stdc++.h>
using namespace std;
int main()
{
    long long n,t=1,i,j;
    cin>>n;
    while(n-t>0)
    {
        n=n-t;
        t++;
    }
    if(t%2==0)
    {
        cout<<n<<"/"<<t-n+1<<endl;
    }
    else
        cout<<t-n+1<<"/"<<n<<endl;
    return 0;
}
