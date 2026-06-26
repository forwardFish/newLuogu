#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m, d;
    cin >> n >> m >> d;

    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < m; ++i) {
        int u, v;
        cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    vector<int> deg(n + 1);
    for (int u = 1; u <= n; ++u) {
        deg[u] = adj[u].size();
    }

    vector<bool> deleted(n + 1, false);
    queue<int> q;

    for (int u = 1; u <= n; ++u) {
        if (deg[u] < d) {
            q.push(u);
        }
    }

    while (!q.empty()) {
        int u = q.front();
        q.pop();

        if (deleted[u]) continue;
        if (deg[u] >= d) continue;

        deleted[u] = true;

        for (int v : adj[u]) {
            if (!deleted[v]) {
                deg[v]--;
                if (deg[v] == d - 1) {
                    q.push(v);
                }
            }
        }
    }

    vector<bool> visited(n + 1, false);
    vector<int> max_component;

    for (int u = 1; u <= n; ++u) {
        if (!deleted[u] && !visited[u]) {
            queue<int> q_bfs;
            vector<int> component;
            q_bfs.push(u);
            visited[u] = true;
            component.push_back(u);

            while (!q_bfs.empty()) {
                int v = q_bfs.front();
                q_bfs.pop();

                for (int w : adj[v]) {
                    if (!deleted[w] && !visited[w]) {
                        visited[w] = true;
                        q_bfs.push(w);
                        component.push_back(w);
                    }
                }
            }

            if (component.size() > max_component.size()) {
                max_component = component;
            }
        }
    }

    if (max_component.empty()) {
        cout << "NIE\n";
    } else {
        cout << max_component.size() << '\n';
        sort(max_component.begin(), max_component.end());
        for (size_t i = 0; i < max_component.size(); ++i) {
            cout << max_component[i] << " \n"[i == max_component.size() - 1];
        }
    }

    return 0;
}