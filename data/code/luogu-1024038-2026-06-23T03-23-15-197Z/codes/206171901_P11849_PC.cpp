#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

ll gcd(ll a, ll b) {
    return b ? gcd(b, a % b) : a;
}

int main() {
    int n, k;
    cin >> n >> k;
    vector<ll> w(n);
    for (int i = 0; i < n; ++i) {
        cin >> w[i];
    }
    sort(w.begin(), w.end()); // 升序排列

    double left = -1e18; // 初始范围设为极大值
    double right = 1e18;

    const int iterations = 100;
    for (int it = 0; it < iterations; ++it) {
        double mid = (left + right) / 2.0;

        // 统计单元素数目：w[i] >= mid
        int cnt1 = w.end() - lower_bound(w.begin(), w.end(), mid);

        // 统计双元素数目：i < j，且(w[i] + w[j])/2 >= mid
        ll cnt2 = 0;
        for (int i = 0; i < n; ++i) {
            double target = 2 * mid - w[i];
            auto j = lower_bound(w.begin() + i + 1, w.end(), target);
            cnt2 += w.end() - j;
        }

        // 调整二分范围
        if (cnt1 + cnt2 >= k) {
            left = mid;
        } else {
            right = mid;
        }
    }

    // 转换为分数形式
    ll p, q;
    const double eps = 1e-9;
    double value = left;

    // 检查是否为整数
    if (abs(value - round(value)) < eps) {
        p = round(value);
        q = 1;
    } else {
        // 视为半整数
        p = round(value * 2);
        q = 2;
    }

    // 约分
    ll g = gcd(abs(p), q);
    p /= g;
    q /= g;

    cout << p << '\n' << q << endl;

    return 0;
}