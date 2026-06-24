#include <iostream>
#include <vector>
using namespace std;
const int MOD = 998244353;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long n, m, q;
    cin >> n >> m >> q;
    vector<long long> a(n + 1, 0);
    for (int i = 0; i < m; ++i) {
        long long l, r, b;
        cin >> l >> r >> b;
        for (long long j = l; j <= r; ++j) {
            a[j] = b;
        }
    }
    vector<long long> prefix_sum(n + 1, 0);
    vector<long long> prefix_sq_sum(n + 1, 0);
    for (long long i = 1; i <= n; ++i) {
        prefix_sum[i] = (prefix_sum[i-1] + a[i]) % MOD;
        prefix_sq_sum[i] = (prefix_sq_sum[i-1] + a[i] * a[i]) % MOD;
    }
    while (q--) {
        long long l, r;
        cin >> l >> r;
        long long len = r - l + 1;

        long long sum_lr = (prefix_sum[r] - prefix_sum[l-1] + MOD) % MOD;
        long long sq_sum_lr = (prefix_sq_sum[r] - prefix_sq_sum[l-1] + MOD) % MOD;
        long long mean = sum_lr / len;

        long long s2 = (sq_sum_lr - 2 * mean * sum_lr + len * mean * mean % MOD + MOD) % MOD;
        long long result = (s2 * len * len) % MOD;
        cout << result << '\n';
    }
    return 0;
}
