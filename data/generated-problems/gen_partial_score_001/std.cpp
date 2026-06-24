#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
const ll INF = 1e18;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);
    int N, K;
    cin >> N >> K;
    vector<int> A(N + 1);
    for (int i = 1; i <= N; ++i) cin >> A[i];
    vector<vector<ll>> dp(K + 1, vector<ll>(N + 1, INF));
    dp[0][0] = 0;
    for (int k = 1; k <= K; ++k) {
        vector<ll> f = dp[k - 1];
        vector<ll>& g = dp[k];
        stack<pair<int, ll>> st;
        for (int i = 1; i <= N; ++i) {
            ll cur = (f[i - 1] == INF ? INF : f[i - 1] + A[i]);
            while (!st.empty() && A[st.top().first] <= A[i]) {
                if (st.top().second != INF) {
                    cur = min(cur, st.top().second - A[st.top().first] + A[i]);
                }
                st.pop();
            }
            if (!st.empty()) {
                if (st.top().second != INF) {
                    cur = min(cur, st.top().second);
                }
            }
            st.push({i, cur});
            g[i] = cur;
        }
    }
    cout << dp[K][N] << '\n';
    return 0;
}