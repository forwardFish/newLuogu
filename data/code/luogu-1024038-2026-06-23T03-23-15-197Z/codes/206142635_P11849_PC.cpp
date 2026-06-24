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
    sort(w.begin(), w.end(), greater<ll>());

    double left = *min_element(w.begin(), w.end());
    double right = *max_element(w.begin(), w.end());

    const int iterations = 100;
    for (int it = 0; it < iterations; ++it) {
        double mid = (left + right) / 2.0;

        int cnt1 = lower_bound(w.begin(), w.end(), mid, [](ll a, double m) {
            return a > m;
        }) - w.begin();

        int cnt2 = 0;
        for (int j = 0; j < n; ++j) {
            double target = 2 * mid - w[j];
            auto pos = lower_bound(w.begin(), next(w.begin(), j), target, [](ll a, double t) {
                return a > t;
            });
            cnt2 += pos - w.begin();
        }

        if (cnt1 + cnt2 >= k) {
            left = mid;
        } else {
            right = mid;
        }
    }

    ll p, q;
    const double eps = 1e-9;

    if (abs(left - round(left)) < eps) {
        p = round(left);
        q = 1;
    } else {
        double doubled = left * 2;
        p = round(doubled);
        q = 2;
        if (abs(doubled - p) > eps) {
            p = round(left * 2);
            q = 2;
        }
    }

    ll g = gcd(abs(p), q);
    p /= g;
    q /= g;

    cout << p << '\n' << q << endl;

    return 0;
}