#include <bits/stdc++.h>
using namespace std;
const int INF = 0x3f3f3f3f;
const int N = 100005;
int v[N], a[N];
int main()
{
    int n,d;
    scanf("%d%d",&n,&d);
    for (int i=1;i<n;i++) scanf("%d",&v[i]);
    int mi=INF;
    long long ans=0,s=0;
    for (int i=1;i<n;i++)
	{
        scanf("%d",&a[i]);
        s+=v[i];
        mi=min(mi,a[i]);
        if(s>0) 
		{
            ans+=(s+d-1)/d*mi;
            s-=(s+d-1)/d*d;
        }
    }
    printf("%lld",ans);
    return 0;
}