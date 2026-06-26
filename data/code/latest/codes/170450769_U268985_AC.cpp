#include<bits/stdc++.h>
using namespace std;
const int N=1e5+5;
int n,m,x;
int a[N],b[N];
int main()
{
    cin>>n>>m>>x;
    for(int i=1;i<=n;i++) cin>>a[i];
    for(int i=1;i<=m;i++) cin>>b[i];
    int l=1,r=m;
    while(l<=n)
    {
        while(r > 1 && a[l]+b[r]>x) r--;
        if(a[l]+b[r]==x)
        {
            cout<<l-1<<" "<<r-1<<endl;
            return 0;
        }
        l++;
    }
    return 0;
}