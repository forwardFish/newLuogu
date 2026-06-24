#include<bits/stdc++.h>
using namespace std;
#define int long long 
const int N=1e6+5;
int a[N],b[N];
signed main()
{
    int n,k;
    cin>>n>>k;
    for(int i=1;i<=k;i++) cin>>a[i];
    for(int i=1;i<=k;i++) cin>>b[i];
    int a1=1,b1=1;
    sort(a+1,a+k+1);
    sort(b+1,b+k+1);
    for(int i=2;i<=k;i++)
    {
        if(a[i]!=a[i-1]) a1++;
        if(b[i]!=b[i-1]) b1++;
    }
    cout<<n*n-(n-a1)*(n-b1)<<endl;
    return 0;
}