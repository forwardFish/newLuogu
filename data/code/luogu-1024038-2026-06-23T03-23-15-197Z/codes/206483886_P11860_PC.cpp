#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    int n, m;
    cin >> n >> m;
    vector<vector<pair<int, int>>> adj(n + 1);
    for (int i = 0; i < m; ++i) {
        int a, b, c;
        cin >> a >> b >> c;
        adj[a].emplace_back(b, c);
        adj[b].emplace_back(a, c);
    }
    vector<unordered_map<int, ll>> dist(n + 1);
    for (int u = 1; u <= n; ++u) {
        dist[u].reserve(adj[u].size() + 1);  
    }
    using State = tuple<ll, int, int>;
    priority_queue<State, vector<State>, greater<>> pq;
    
    for (auto& [v, c] : adj[1]) {
        ll cost = abs(c);
        if (!dist[v].count(c) || cost < dist[v][c]) {
            dist[v][c] = cost;
            pq.emplace(cost, v, c);
        }
    }
    
    while (!pq.empty()) {
        auto [cost, u, c_prev] = pq.top();
        pq.pop();
        if (u == n) {
            cout << cost << '\n';
            return 0;
		}
        if (dist[u].count(c_prev) && dist[u][c_prev] < cost)
            continue;
        for (auto& [v, c_edge] : adj[u]) {
            ll new_cost = cost + abs(c_prev - c_edge);
            
            if (dist[v].count(c_edge) && dist[v][c_edge] <= new_cost)
                continue;
                
            if (!dist[v].count(c_edge) || new_cost < dist[v][c_edge]) {
                dist[v][c_edge] = new_cost;
                pq.emplace(new_cost, v, c_edge);
            }
        }
    }
    
    cout << -1 << '\n';
    return 0;
}