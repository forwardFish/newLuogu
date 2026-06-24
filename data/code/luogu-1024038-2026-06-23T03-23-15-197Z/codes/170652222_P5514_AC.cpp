#include<bits/stdc++.h>
using namespace std;
#define int long long
const int N=1e6+5;
int sum,a[N];
signed main()
{
    int n;
    cin>>n;
    for(int i=1;i<=n;i++)
    {
        cin>>a[i];
        sum^=a[i];
    }
    cout<<sum<<endl;
    return 0;
}