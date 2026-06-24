#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

const int MAXN = 300005;
vector<int> tree[MAXN];
int depth[MAXN];
int subtree_size[MAXN];
long long node_value[MAXN];
long long depth_sum[MAXN][2]; // depth_sum[i][0] stores sum of v_y where dis(x, y) is even, depth_sum[i][1] for odd
int parent[MAXN];

// DFS to initialize depth and subtree size
void dfs(int node, int par, int dep) {
    parent[node] = par;
    depth[node] = dep;
    subtree_size[node] = 1;
    for (int child : tree[node]) {
        if (child == par) continue;
        dfs(child, node, dep + 1);
        subtree_size[node] += subtree_size[child];
    }
}

// Update depth_sum arrays for the subtree rooted at `node`
void update_depth_sum(int node, int par, int dep, int delta) {
    depth_sum[node][dep % 2] += delta;
    for (int child : tree[node]) {
        if (child == par) continue;
        update_depth_sum(child, node, dep + 1, delta);
    }
}

// Compute the value of f(x) for the subtree rooted at `node`
long long compute_f(int node) {
    return max(depth_sum[node][0], depth_sum[node][1]);
}

// Compute the sum of f(i) for all nodes i in the subtree rooted at `node`
long long compute_subtree_f(int node, int par) {
    long long sum = compute_f(node);
    for (int child : tree[node]) {
        if (child == par) continue;
        sum += compute_subtree_f(child, node);
    }
    return sum;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);

    int n, m;
    cin >> n >> m;

    for (int i = 2; i <= n; ++i) {
        int p;
        cin >> p;
        tree[p].push_back(i);
        tree[i].push_back(p);
    }

    dfs(1, 0, 0);

    for (int i = 0; i < m; ++i) {
        int x, w, y;
        cin >> x >> w >> y;
        node_value[x] += w;
        update_depth_sum(x, parent[x], depth[x], w);
        cout << compute_subtree_f(y, parent[y]) << endl;
    }

    return 0;
}
