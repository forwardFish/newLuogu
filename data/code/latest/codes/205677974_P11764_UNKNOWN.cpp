#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

typedef long long ll;
const ll INF = 2e9;

vector<pair<ll, ll>> intersect(const vector<pair<ll, ll>>& a, const vector<pair<ll, ll>>& b) {
    vector<pair<ll, ll>> res;
    int i = 0, j = 0;
    while (i < a.size() && j < b.size()) {
        ll l = max(a[i].first, b[j].first);
        ll r = min(a[i].second, b[j].second);
        if (l <= r) {
            if (res.empty() || res.back().second < l - 1) {
                res.emplace_back(l, r);
            } else {
                res.back().second = max(res.back().second, r);
            }
        }
        if (a[i].second < b[j].second) i++;
        else j++;
    }
    return res;
}

vector<pair<ll, ll>> generate_intervals(int type, ll y, ll p) {
    vector<pair<ll, ll>> intervals;
    if (type == 1) {
        ll l = max(y - p, 0LL);
        ll r = y + p;
        if (l <= r) intervals.emplace_back(l, r);
    } else {
        ll left_part = y - p - 1;
        ll right_part = y + p + 1;
        if (left_part >= 0) intervals.emplace_back(0, left_part);
        if (right_part <= INF) intervals.emplace_back(right_part, INF);
    }
    return intervals;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int T;
    cin >> T;
    while (T--) {
        int n, m;
        cin >> n >> m;
        vector<vector<pair<ll, ll>>> constraints(n + 1);
        bool possible = true;

        for (int idx = 0; idx < m; ++idx) {
            int x, y, k, p;
            cin >> x >> y >> k >> p;
            ll total = (ll)n * (n + 1) / 2;
            ll c = (ll)x * (n - x + 1);
            ll t = total - c;

            if (k != total && k != t) {
                possible = false;
                continue;
            }

            int type = (k == total) ? 1 : 2;
            auto intervals = generate_intervals(type, y, p);

            if (intervals.empty()) {
                possible = false;
                continue;
            }

            if (constraints[x].empty()) {
                constraints[x] = intervals;
            } else {
                auto merged = intersect(constraints[x], intervals);
                if (merged.empty()) {
                    possible = false;
                } else {
                    constraints[x] = merged;
                }
            }
        }

        if (!possible) {
            cout << "-1\n";
            continue;
        }

        vector<ll> a(n + 1, 0);
        for (int x = 1; x <= n; ++x) {
            if (constraints[x].empty()) {
                possible = false;
                break;
            }
            ll min_val = INF + 1;
            for (auto& [l, r] : constraints[x]) {
                if (l <= r) {
                    min_val = min(min_val, l);
                }
            }
            if (min_val > INF) {
                possible = false;
                break;
            }
            a[x] = min_val;
        }

        if (!possible) {
            cout << "-1\n";
        } else {
            for (int i = 1; i <= n; ++i) {
                cout << a[i] << " ";
            }
            cout << "\n";
        }
    }

    return 0;
}