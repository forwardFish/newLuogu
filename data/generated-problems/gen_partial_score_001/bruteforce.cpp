#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);
    int N, M;
    cin >> N >> M;
    vector<int> A(N);
    for (int i=0; i<N; ++i) cin >> A[i];
    if (M == 1) {
        cout << *max_element(A.begin(), A.end()) << '\n';
        return 0;
    }
    ll ans = LLONG_MAX;
    int cuts = M - 1;
    int total_positions = N - 1;
    vector<int> perm(total_positions, 0);
    for (int i = 0; i < cuts; ++i) perm[total_positions - 1 - i] = 1;
    do {
        ll cost = 0;
        int prev = 0;
        for (int i = 0; i < total_positions; ++i) {
            if (perm[i] == 1) {
                int mx = *max_element(A.begin() + prev, A.begin() + i + 1);
                cost += mx;
                prev = i + 1;
            }
        }
        int mx = *max_element(A.begin() + prev, A.end());
        cost += mx;
        ans = min(ans, cost);
    } while (next_permutation(perm.begin(), perm.end()));
    cout << ans << '\n';
    return 0;
}