#include<bits/stdc++.h>
using namespace std;

bool check(vector<int>& a, vector<int>& b, int k) {
    int n = a.size();
    int m = b.size();
    for (int i = 0; i < (1 << n); ++i)
	{
        for (int j = 0; j < (1 << m); ++j)
		{
            vector<int> sa, sb;
            for (int x = 0; x < n; ++x)
			{
                if (i & (1 << x)) {
                    sa.push_back(a[x]);
                }
            }
            for (int y = 0; y < m; ++y)
			{
                if (j & (1 << y))
				{
                    sb.push_back(b[y]);
                }
            }
            if (sa.size() == k / 2 && sb.size() == k / 2)
			{
                vector<bool> v(k + 1, false);
                for (int num : sa)
				{
                    if (num <= k) v[num] = true;
                }
                for (int num : sb)
				{
                    if (num <= k) v[num] = true;
                }
                bool a = true;
                for (int z = 1; z <= k; ++z)
				{
                    if (!v[z])
					{
                        a = false;
                        break;
                    }
                }
                if (a) return true;
            }
        }
    }
    return false;
}
int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);cout.tie();
    int T;
    cin >> T;
    while (T--) {
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
        if (check(a, b, k))
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
