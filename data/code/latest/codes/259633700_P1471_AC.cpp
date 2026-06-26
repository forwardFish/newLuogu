#include <bits/stdc++.h>
using namespace std;
double a[100010];

struct node{
    double sum, lazy;
};

node t1[400010], t2[400010];

inline void pushup(int rt)
{
    t1[rt].sum = t1[rt << 1].sum + t1[rt << 1 | 1].sum;	
    t2[rt].sum = t2[rt << 1].sum + t2[rt << 1 | 1].sum;	
}

inline void pushdown(int rt, int l, int r)
{
    int mid = (l + r) >> 1;
    t2[rt << 1].lazy += t2[rt].lazy;
    t2[rt << 1].sum += t1[rt << 1].sum * (t2[rt].lazy * 2) + (mid - l + 1) * (t2[rt].lazy * t2[rt].lazy);
    t2[rt << 1 | 1].lazy += t2[rt].lazy;
    t2[rt << 1 | 1].sum += t1[rt << 1 | 1].sum * (t2[rt].lazy * 2) + (r - mid) * (t2[rt].lazy * t2[rt].lazy);
    t2[rt].lazy = 0;
    t1[rt << 1].lazy += t1[rt].lazy;
    t1[rt << 1].sum += (mid - l + 1) * t1[rt].lazy;
    t1[rt << 1 | 1].lazy += t1[rt].lazy;
    t1[rt << 1 | 1].sum += (r - mid) * t1[rt].lazy;	
    t1[rt].lazy = 0;
}

void build(int rt, int l, int r)
{
    if (l == r) //叶子节点 
    {
        t1[rt].sum = a[l];
        t2[rt].sum = a[l] * a[l];
        return;	
    }
    int mid = (l + r) >> 1;
    build(rt << 1, l, mid);
    build(rt << 1 | 1, mid + 1, r);
    pushup(rt);
}

double query(node tree[], int rt, int l, int r, int x, int y)
//当前节点为rt,区间为l到r,我们要查询x到y
{
    if (x <= l && r <= y) return tree[rt].sum;
    int mid = (l + r) >> 1;
    if (tree[rt].lazy) pushdown(rt, l, r);
    double ans = 0;
    if (x <= mid) ans = ans + query(tree, rt << 1, l, mid, x, y);
    if (y > mid) ans = ans + query(tree, rt << 1 | 1, mid + 1, r, x, y);
    pushup(rt);
    return ans;
}

void modify(int rt, int l, int r, int x, int y , double z)
//当前节点为rt,区间为l到r，我们把区间x到y的每个值都上z 
{
    if (x <= l && r <= y)
    {
        t2[rt].lazy += z;
        t2[rt].sum += t1[rt].sum * (z * 2) + (r - l + 1) * (z * z);
        t1[rt].lazy += z;
        t1[rt].sum += (r - l + 1) * z;
        return;
    }
    if (t1[rt].lazy || t2[rt].lazy) pushdown(rt, l, r); 
    int mid = (l + r) >> 1; 
    if (x <= mid) modify(rt << 1, l, mid, x, y, z);
    if (y > mid) modify(rt << 1 | 1, mid + 1, r, x, y, z);
    pushup(rt);
}
int n, m, opt;
int main()
{
    scanf("%d%d", &n, &m);
    for (register int i = 1;i <= n;i ++)
    {
        scanf("%lf", &a[i]);
    }
    build(1, 1, n);
    while(m --)
    {
        scanf("%d", &opt);
        if(opt == 1)
        {
            int x, y;
            double z;
            scanf("%d%d%lf", &x, &y, &z);
            modify(1, 1, n, x, y, z);
        }
        if(opt == 2)
        {
            int x, y;
            scanf("%d%d", &x, &y);
            printf("%.4lf\n", query(t1, 1, 1, n, x, y) / ((y - x + 1) * 1.0));
        }
        if(opt == 3)
        {
            int x, y;
            scanf("%d%d", &x, &y);
            printf("%.4lf\n", (query(t2, 1, 1, n, x, y) / ((y - x + 1) * 1.0)) - (query(t1, 1, 1, n, x, y) / ((y - x + 1) * 1.0)) * (query(t1, 1, 1, n, x, y) / ((y - x + 1) * 1.0)));
        }
    }
}
