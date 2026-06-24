#include<bits/stdc++.h>
#define ll long int
#define _for(i,a,b) for(ll i=a;i<=b;i++)
using namespace std;
int main()
{
    ll k,m,a[30005],b[30005],n,e[30005];
    bool pd=0;
    cin>>k>>m>>n;
    _for(i,1,m)
    {
        cin>>a[i]>>b[i];
        
        if(a[i]==0) e[i]=n;
          else if(a[i]!=0) e[i]=(k/a[i])*b[i];
		if(e[i]>=n) cout<<i<<" ",pd=1;
    }
    if(pd==0) cout<<-1;
    return 0;
}