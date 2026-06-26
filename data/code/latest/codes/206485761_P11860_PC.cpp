#include <bits/stdc++.h>
using namespace std;
using ll = long long;

struct State {
    ll cost;
    int node;
    int temp;
    
    bool operator>(const State& other) const {
        return cost > other.cost;
    }
};

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
    
    vector<map<int, ll>> dist(n + 1);
    priority_queue<State, vector<State>, greater<>> pq;
    
    for (auto [v, c] : adj[1]) {
        ll new_cost = abs(c);  
        if (!dist[v].count(c) || new_cost < dist[v][c]) {
            dist[v][c] = new_cost;
            pq.push({new_cost, v, c});
        }
    }
    
    while (!pq.empty()) {
        auto [current_cost, u, current_temp] = pq.top();
        pq.pop();
        
        if (u == n) {
            cout << current_cost << '\n';
            return 0;
        }
        if (dist[u].count(current_temp) && dist[u][current_temp] < current_cost)
            continue;
        
        for (auto [v, edge_temp] : adj[u]) {
            ll new_cost = current_cost + abs(current_temp - edge_temp);
            
            auto it = dist[v].find(edge_temp);
            if (it == dist[v].end() || new_cost < it->second) {
                dist[v][edge_temp] = new_cost;
                pq.push({new_cost, v, edge_temp});
            }
        }
    }
    
    cout << -1 << '\n';
    return 0;
}