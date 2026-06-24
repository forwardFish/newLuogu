#include<bits/stdc++.h>
using namespace std;
const int maxn = 1000001;
bool c(int n, int m, int k, vector<int>& a, vector<int>& b)
{
    bool pa[maxn] = {false};
    bool pb[maxn] = {false};
    for (int num : a)
	{
        pa[num] = true;
    }
    for (int num : b)
	{
        pb[num] = true;
    }
    int ma = 0;
    int mb = 0;
    int e = 0;
    for (int i = 1; i <= k; ++i)
	{
        if (pa[i] && pb[i])
		{
            e++;
        }
		else if (pa[i])
		{
            ma++;
        }
		else if (pb[i])
		{
            mb++;
        }
		else
		{
            return false;
        }
    }
    if (ma > k / 2 || mb > k / 2)
	{
        return false;
    }
    int r = k - (ma + mb);
    if (r > e) {
        return false;
    }
    return true;
}
int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);cout.tie();
    int T;
    cin >> T;
    while (T--)
	{
        int n, m, k;
        cin >> n >> m >> k;
        vector<int> a(n), b(m);
        for (int i = 0; i < n; ++i)
		{
            cin >> a[i];
        }
        for (int i = 0; i < m; ++i)
		{
            cin >> b[i];
        }
        if (c(n, m, k, a, b))
		{
            cout << "YES" << endl;
        }
		else
		{
            cout << "NO" << endl;
        }
    }
    return 0;
}
