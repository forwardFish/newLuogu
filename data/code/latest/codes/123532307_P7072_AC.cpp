#include <cstdio>
#include <algorithm>
using namespace std;
const int N = 2401;
int n, w;
struct Tree
{
    int l, r, v;
}tr[N];
void hs(int u)
{
    tr[u].v = tr[u << 1].v + tr[u << 1 | 1].v;
}
void sb(int u, int l, int r)
{
    tr[u].l = l, tr[u].r = r;
    if (l == r) return;
    int mid = l + r >> 1;
    sb(u<<1,l,mid);
    sb(u<<1|1,mid+1,r);
}
void ss(int u, int x)
{
    if (tr[u].l==x&&tr[u].r==x)tr[u].v++ ;
    else
    {
        int mid=tr[u].l+tr[u].r>>1;
        if (x<=mid) ss(u<<1,x);
        else ss(u<<1|1,x);
        hs(u);
    }
}
int AK(int u, int k)
{
    if (tr[u].l==tr[u].r) return tr[u].r;
    if (tr[u<<1].v>=k) return AK(u<<1,k);
    return AK(u<<1|1,k-tr[u<<1].v);
}
int main()
{
    scanf("%d%d", &n, &w);
    sb(1,0,600);
    for (int i=1;i<=n;i++)
    {
        int x;
        scanf("%d",&x);
        ss(1,x);
        printf("%d ",AK(1,i-max(1,i*w/100)+1));
    }
    return 0;
}