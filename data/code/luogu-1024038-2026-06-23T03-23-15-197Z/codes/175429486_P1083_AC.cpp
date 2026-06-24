#include<bits/stdc++.h>
#define int long long
#define endl '\n'
using namespace std;
int n,m;
int a[1000011],b[1000011],c[1000011],r[1000011],len[1000011],d[1000011];
bool pd(int x)
{
    memset(a,0,sizeof(a));
    for(int i=1;i<=x;i++)
    {
        a[len[i]]+=d[i];
        a[r[i]+1]-=d[i]; 
    }
    for(int i=1;i<=n;i++)
    {
        b[i]=b[i-1]+a[i];
        if(b[i]>c[i]) return false;
    }
    return true;
} 
signed main()
{
    cin>>n>>m;
    for(int i=1;i<=n;i++) cin>>c[i];
    for(int i=1;i<=m;i++) cin>>d[i]>>len[i]>>r[i];
    int l=1,r=m;
    if(pd(m))
	{
		cout<<"0";
		return 0;
	}
    while(l<r)
    {
        int mid=(l+r)/2;
        if(pd(mid)) l=mid+1;
        else r=mid;
    }
    cout<<"-1"<<endl<<l;
}