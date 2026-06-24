#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
#include <iomanip>

using namespace std;

typedef long long ll;
typedef pair<int, int> pii;
typedef pair<ll, int> pli;

const int MAXN = 1e5 + 5;
vector<pii> adj[MAXN];
ll dist[MAXN];
int parent[MAXN];

void bfs(int start, int n) {
    fill(dist, dist + n + 1, -1);
    queue<int> q;
    q.push(start);
    dist[start] = 0;
    parent[start] = -1;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (auto &edge : adj[u]) {
            int v = edge.first;
            int w = edge.second;
            if (dist[v] == -1) {
                dist[v] = dist[u] + w;
                parent[v] = u;
                q.push(v);
            }
        }
    }
}

pli findFarthest(int start, int n) {
    bfs(start, n);
    ll maxDist = -1;
    int farthest = -1;
    for (int i = 1; i <= n; ++i) {
        if (dist[i] > maxDist) {
            maxDist = dist[i];
            farthest = i;
        }
    }
    return {maxDist, farthest};
}

int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; ++i) {
        int a, b, l;
        cin >> a >> b >> l;
        adj[a].emplace_back(b, l);
        adj[b].emplace_back(a, l);
    }

    auto [d1, u] = findFarthest(1, n);
    auto [d2, v] = findFarthest(u, n);

    vector<int> path;
    for (int x = v; x != -1; x = parent[x]) {
        path.push_back(x);
    }
    reverse(path.begin(), path.end());

    vector<ll> distU(n + 1), distV(n + 1);
    bfs(u, n);
    for (int i = 1; i <= n; ++i) {
        distU[i] = dist[i];
    }
    bfs(v, n);
    for (int i = 1; i <= n; ++i) {
        distV[i] = dist[i];
    }

    ll diameter = distV[u];
    ll radius = diameter / 2;
    if (diameter % 2 == 1) {
        radius++;
    }

    cout << fixed << setprecision(1) << radius << ".0" << endl;

    return 0;
}