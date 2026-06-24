#include <iostream>
#include <vector>
#include <queue>
using namespace std;

const int MOD = 1000000007;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);
    int N, M;
    cin >> N >> M;
    vector<int> color(N + 1);
    for (int i = 1; i <= N; ++i) cin >> color[i];
    vector<vector<int>> adj(N + 1);
    vector<int> indeg(N + 1, 0);
    for (int i = 0; i < M; ++i) {
        int u, v;
        cin >> u >> v;
        adj[u].push_back(v);
        indeg[v]++;
    }
    vector<vector<long long>> dp(N + 1, vector<long long>(2, 0));
    dp[1][color[1]] = 1;
    queue<int> q;
    for (int i = 1; i <= N; ++i) {
        if (indeg[i] == 0) q.push(i);
    }
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (color[v] == 0) {
                dp[v][0] = (dp[v][0] + dp[u][0] + dp[u][1]) % MOD;
            } else {
                dp[v][1] = (dp[v][1] + dp[u][0]) % MOD;
            }
            indeg[v]--;
            if (indeg[v] == 0) q.push(v);
        }
    }
    long long ans = (dp[N][0] + dp[N][1]) % MOD;
    cout << ans << endl;
    return 0;
}