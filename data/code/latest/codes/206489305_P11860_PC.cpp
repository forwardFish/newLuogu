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
        dist[u].reserve(adj[u].size());
    }
    
    using State = tuple<ll, int, int>;
    priority_queue<State, vector<State>, greater<>> pq;
    
    for (auto [v, c] : adj[1]) {
        ll cost = abs(c);
        dist[v][c] = cost;
        pq.emplace(cost, v, c);
    }
    
    while (!pq.empty()) {
        auto [cost, u, temp] = pq.top();
        pq.pop();
        
        if (u == n) {
            cout << cost << '\n';
            return 0;
        }
        if (dist[u][temp] < cost) continue;
        
        for (auto [v, new_temp] : adj[u]) {
            ll new_cost = cost + abs(temp - new_temp);
            
            auto& dst = dist[v];
            auto it = dst.find(new_temp);
            
            if (it == dst.end()) {
                dst[new_temp] = new_cost;
                pq.emplace(new_cost, v, new_temp);
            } else if (new_cost < it->second) {
                it->second = new_cost;
                pq.emplace(new_cost, v, new_temp);
            }
        }
    }
    
    cout << -1 << '\n';
    return 0;
}