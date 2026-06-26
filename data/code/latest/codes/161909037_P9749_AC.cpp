#include <bits/stdc++.h>
using namespace std;
int v[100005],a[100005];
int main()
{
    int n,d;
    scanf("%d%d",&n,&d);
    for (int i=1;i<n;i++)
	{
		scanf("%d",&v[i]);
	}
    int mi= 0x3f3f3f3f;
    long long map=0,s=0;
    for (int i=1;i<n;i++)
	{
        scanf("%d",&a[i]);
        s+=v[i];
        mi=min(mi,a[i]);
        if(s>0) 
		{
            map+=(s+d-1)/d*mi;
            s-=(s+d-1)/d*d;
        }
    }
    printf("%lld",map);
    return 0;
}