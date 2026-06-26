#include<bits/stdc++.h>
using namespace std;
const int N=1e6+5;
int a[N],b[N],c[N];
int main()
{
    int n,k;
    cin>>n>>k;

    for(int i=1;i<=k;i++)
    {
        int l,r,k1;
        cin>>l>>r>>k1;
        if(k1==1)
        {
            a[l]++;
            a[r+1]--;
        }
        if(k1==2)
        {
            b[l]++;
            b[r+1]--;
        }
        if(k1==3)
        {
            c[l]++;
            c[r+1]--;
        }
    }
    int ans=0;
    for(int i=1;i<=n;i++)
    {
        a[i]+=a[i-1];
        b[i]+=b[i-1];
        c[i]+=c[i-1];
        if(a[i] && b[i] && !c[i]) ans++;
    }
    cout<<ans<<endl;
    return 0;
}