#include <bits/stdc++.h>
using namespace std;
const int MAXN = 5e5 + 5;
int n, m;
long long a[MAXN], sum[MAXN];
long long x = 0;
int solve(long long x) {
    int l = 0, r = n - 1;
    while (l <= r)
	{
        int mid = (l + r) / 2;
        if (a[mid] >= -x)
		{
            r = mid - 1;
        }
		else
		{
            l = mid + 1;
        }
    }
    return l;
}
int main()
{
    ios::sync_with_stdio(false);
    cin.tie(0);cout.tie(0);
    cin >> n >> m;
    for (int i = 0; i < n; ++i) {
        cin >> a[i];
    }
    // 排序
    sort(a, a + n);
    // 预处理后缀和
    sum[n] = 0;
    for (int i = n-1; i >= 0; --i)
	{
        sum[i] = sum[i + 1] + a[i];
    }
    while (m--) {
        int op;
        cin >> op;
        if (op == 1)
		{
            int k;
            cin >> k;
            x += k;
        }
        else if (op == 2)
		{ 
            long long ans = sum[solve(x)] + (n - solve(x)) * x;
            cout << ans << endl;
        }
    }

    return 0;
}
