#include<bits/stdc++.h>
using namespace std;
const int N=1e6+5;
int a[N],b[N];
int main()
{
    int n,k;
    cin>>n>>k;
    for(int i=1;i<=k;i++) cin>>a[i];
    for(int i=1;i<=k;i++) cin>>b[i];
    int a1=0,b1=0;
    for(int i=1;i<=k;i++)
    {
        if(a[i]!=a[i+1]) a1++;
        if(b[i]!=b[i+1]) b1++;
    }
    cout<<n*n-(n-a1)*(n-b1)<<endl;
    return 0;
}