#include <iostream>
#include <vector>
using namespace std;

const int MOD = 1e9+7;
int N, M;
vector<int> color;
vector<vector<int>> adj;
int ans = 0;

void dfs(int u, int prev_color, int path_len) {
    if (u == N) {
        ans = (ans + 1) % MOD;
        return;
    }
    for (int v : adj[u]) {
        if (color[u] == 1 && color[v] == 1) continue;
        dfs(v, color[u], path_len+1);
    }
}

int main() {
    cin >> N >> M;
    color.resize(N+1);
    for (int i = 1; i <= N; ++i) cin >> color[i];
    adj.resize(N+1);
    for (int i = 0; i < M; ++i) {
        int u, v;
        cin >> u >> v;
        adj[u].push_back(v);
    }
    dfs(1, -1, 1);
    cout << ans << endl;
    return 0;
}