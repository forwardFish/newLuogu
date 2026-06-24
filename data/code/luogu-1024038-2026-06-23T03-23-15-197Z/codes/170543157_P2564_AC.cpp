#include<bits/stdc++.h>
#define int long long
using namespace std;
const int N=1e6+5;
struct node
{
	int color,pos;
}a[N];
bool cmp(node a,node b)
{
    return a.pos<b.pos;
}
int n,k,len,ans=INT_MAX,tong[70];
signed main()
{
    cin>>n>>k;
    for(int j=1;j<=k;j++)
    {
        int t;
        cin>>t;
        for(int i=1;i<=t;i++)
        {
            cin>>a[++len].pos;
            a[len].color=j;
        }
    }
    sort(a+1,a+len+1,cmp);
    int l=1,r=1,tot=0;
    while(r<=len)
    {
        tong[a[r].color]++;
        if(tong[a[r].color]==1)
        {
            tot++;
        }
        while(tong[a[l].color]>1)
        {
            tong[a[l].color]--;
            l++;
        }
        if(tot==k)
        {
            ans=min(a[r].pos-a[l].pos,ans);
        }
        r++;
    }
    cout<<ans<<endl;
	return 0;
}
