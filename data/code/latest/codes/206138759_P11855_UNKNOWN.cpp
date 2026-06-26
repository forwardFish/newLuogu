#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

const int MAXN = 1e6 + 10;

vector<int> adj[MAXN];
int parent[MAXN];
int in[MAXN], out[MAXN];
int a[MAXN];
int diff[MAXN];
int timer = 0;

void dfs(int u, int p) {
    parent[u] = p;
    in[u] = ++timer;
    for (int v : adj[u]) {
        if (v != p) {
            dfs(v, u);
        }
    }
    out[u] = timer;
}

void add_subtree(int x, int y) {
    diff[in[x]] += y;
    diff[out[x] + 1] -= y;
}

void add_neighbors(int x, int y) {
    diff[in[x]] += y;
    if (parent[x] != -1) {
        diff[in[parent[x]]] += y;
    }
    for (int v : adj[x]) {
        if (v != parent[x]) {
            diff[in[v]] += y;
        }
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;
    for (int i = 1; i <= n; ++i) {
        cin >> a[i];
    }
    for (int i = 1; i < n; ++i) {
        int x, y;
        cin >> x >> y;
        adj[x].push_back(y);
        adj[y].push_back(x);
    }

    dfs(1, -1);

    int m;
    cin >> m;
    for (int i = 0; i < m; ++i) {
        int p, x, y;
        cin >> p >> x >> y;
        if (p == 1) {
            add_subtree(x, y);
        } else {
            add_neighbors(x, y);
        }
    }

    for (int i = 1; i <= n; ++i) {
        diff[i] += diff[i - 1];
        a[i] += diff[in[i]];
    }

    int q;
    cin >> q;
    for (int i = 0; i < q; ++i) {
        int x;
        cin >> x;
        cout << a[x] << '\n';
    }

    return 0;
}