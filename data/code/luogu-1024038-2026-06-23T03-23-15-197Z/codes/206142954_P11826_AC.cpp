#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    long long m, n;
    cin >> m >> n;

    long long t, k, r;
    cin >> t >> k >> r;

    vector<long long> c(t);
    for (auto &ci : c) cin >> ci;

    if (k > m || k > n) {
        cout << 0 << endl;
        return 0;
    }

    long long s_max = n - k + 1;

    // Case 1: submatrix includes column r
    long long case1_col_start = max(1LL, r - k + 1);
    long long case1_col_end = min(r, m - k + 1);
    long long case1_col_count = (case1_col_end >= case1_col_start) ? (case1_col_end - case1_col_start + 1) : 0;

    long long case1_count = 0;
    if (case1_col_count > 0 && s_max >= 1) {
        vector<pair<long long, int>> events;

        for (auto ci : c) {
            long long a_i = max(1LL, ci - k + 1);
            long long b_i = min(ci, s_max);
            if (a_i > b_i) continue;

            events.emplace_back(a_i, 1);
            events.emplace_back(b_i + 1, -1);
        }

        sort(events.begin(), events.end());

        long long current = 0;
        long long last_pos = 1;
        long long res = 0;
        int k_sq_mod_2 = (k * k) % 2;

        for (auto &event : events) {
            long long pos = event.first;
            int delta = event.second;

            long long start = max(last_pos, 1LL);
            long long end = min(pos - 1, s_max);
            if (start <= end) {
                int parity = current % 2;
                if (parity != k_sq_mod_2) {
                    res += end - start + 1;
                }
            }

            current += delta;
            last_pos = pos;
        }

        // Handle remaining interval
        long long start = max(last_pos, 1LL);
        long long end = s_max;
        if (start <= end) {
            int parity = current % 2;
            if (parity != k_sq_mod_2) {
                res += end - start + 1;
            }
        }

        case1_count = case1_col_count * res;
    }

    // Case 2: submatrix does not include column r
    long long left = max(0LL, r - k);
    long long right = max(0LL, (m - k + 1) - r);
    long long case2_col_count = left + right;

    long long case2_count = 0;
    if ((k * k) % 2 == 1) {
        long long row_count = max(0LL, n - k + 1);
        case2_count = case2_col_count * row_count;
    }

    cout << case1_count + case2_count << endl;

    return 0;
}