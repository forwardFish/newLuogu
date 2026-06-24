#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
#include <cstring>
#include <cmath>
using namespace std;

typedef long long ll;
const int MAXN = 1e6 + 5;
const int MOD = 998244353;

int n;
int a[MAXN], opt[MAXN];
vector<int> parent[MAXN]; 
int in_degree[MAXN];
int comp_id[MAXN];
int comp_count = 0;
vector<int> components[MAXN];
int cycle_node_comp_id[MAXN];
vector<int> comp_cycles[MAXN];
int comp_tree_min[MAXN], comp_tree_max[MAXN];
ll comp_tree_count[MAXN];
int comp_global_min[MAXN], comp_global_max[MAXN];
ll comp_total_count[MAXN];
int in_cycle[MAXN]; 
int cycle_next[MAXN]; 
int cycle_index_in_comp[MAXN];
int node_assign[MAXN]; 
int visited[MAXN];
int is_cycle_node[MAXN];
int is_tree_node[MAXN];
int cycle_length[MAXN];
int comp_node_count[MAXN];
int comp_cycle_length[MAXN];
int comp_tree_node_count[MAXN];
int in_cycle_index[MAXN];
int in_cycle_comp[MAXN];
int comp_cycle_start[MAXN];

void find_components() {
    memset(comp_id, -1, sizeof(comp_id));
    comp_count = 0;
    for (int i = 0; i < n; i++) {
        if (comp_id[i] != -1) continue;
        int u = i;
        vector<int> path;
        while (comp_id[u] == -1) {
            comp_id[u] = comp_count;
            path.push_back(u);
            u = a[u];
        }
        if (comp_id[u] == comp_count) {
            auto it = find(path.begin(), path.end(), u);
            vector<int> cycle;
            for (auto iter = it; iter != path.end(); ++iter) {
                cycle.push_back(*iter);
                in_cycle[*iter] = 1;
            }
            comp_cycles[comp_count] = cycle;
            comp_cycle_start[comp_count] = u;
        } else {
            for (int node : path) {
                comp_id[node] = comp_id[u];
            }
        }
        comp_count++;
    }
    for (int i = 0; i < n; i++) {
        components[comp_id[i]].push_back(i);
        if (in_cycle[i]) {
            comp_cycle_length[comp_id[i]]++;
        }
    }
    for (int i = 0; i < comp_count; i++) {
        comp_node_count[i] = components[i].size();
        if (comp_cycles[i].empty()) {
            for (int j = 0; j < comp_node_count[i]; j++) {
                int node = components[i][j];
                if (in_cycle[node]) {
                    comp_cycles[i].push_back(node);
                }
            }
        }
    }
    for (int i = 0; i < comp_count; i++) {
        if (comp_cycles[i].empty()) continue;
        for (int j = 0; j < comp_cycles[i].size(); j++) {
            int node = comp_cycles[i][j];
            in_cycle_index[node] = j;
            in_cycle_comp[node] = i;
            cycle_next[node] = a[node];
        }
    }
}

void process_component(int comp) {
    if (comp_cycles[comp].empty()) {
        comp_total_count[comp] = 0;
        return;
    }
    vector<int> &cycle = comp_cycles[comp];
    int k = cycle.size();
    ll comp_count_val = 0;
    int comp_min_correct = 1e9;
    int comp_max_correct = -1;
    for (int mask = 0; mask < (1 << k); mask++) {
        for (int i = 0; i < k; i++) {
            int node = cycle[i];
            node_assign[node] = (mask >> i) & 1;
        }
        bool valid_cycle = true;
        for (int i = 0; i < k; i++) {
            int u = cycle[i];
            if (node_assign[u] == 1) {
                int target = a[u];
                int expected = (opt[u] == 1) ? 1 : 0;
                if (node_assign[target] != expected) {
                    valid_cycle = false;
                    break;
                }
            }
        }
        if (!valid_cycle) continue;
        queue<int> q;
        vector<int> tree_assign(n, -1);
        vector<bool> has_parent_set(n, false);
        for (int i = 0; i < k; i++) {
            int u = cycle[i];
            tree_assign[u] = node_assign[u];
            q.push(u);
        }
        vector<int> in_tree_degree = in_degree;
        vector<bool> is_free(n, false);
        bool valid_tree = true;
        ll free_count = 0;
        int fixed_correct = 0;
        while (!q.empty() && valid_tree) {
            int u = q.front(); q.pop();
            for (int v : parent[u]) {
                if (tree_assign[u] == 1) {
                    has_parent_set[v] = true;
                    if (opt[u] == 1) {
                        if (tree_assign[v] == -1) {
                            tree_assign[v] = 1;
                            q.push(v);
                        } else if (tree_assign[v] != 1) {
                            valid_tree = false;
                        }
                    } else {
                        if (tree_assign[v] == -1) {
                            tree_assign[v] = 0;
                            q.push(v);
                        } else if (tree_assign[v] != 0) {
                            valid_tree = false;
                        }
                    }
                }
            }
            if (tree_assign[u] == -1) {
                bool must1 = false, must0 = false;
                for (int p : parent[u]) {
                    if (tree_assign[p] == 1) {
                        if (opt[p] == 1) must1 = true;
                        else must0 = true;
                    }
                }
                if (must1 && must0) {
                    valid_tree = false;
                } else if (must1) {
                    tree_assign[u] = 1;
                } else if (must0) {
                    tree_assign[u] = 0;
                } else {
                    tree_assign[u] = 0;
                    is_free[u] = true;
                    free_count++;
                }
            }
            if (tree_assign[u] == 1) {
                int target = a[u];
                int expected = (opt[u] == 1) ? 1 : 0;
                if (tree_assign[target] != -1 && tree_assign[target] != expected) {
                    valid_tree = false;
                }
            }
        }
        if (!valid_tree) continue;
        int total_correct = 0;
        for (int u : components[comp]) {
            if (tree_assign[u] == 1) {
                total_correct++;
            }
        }
        for (int u : components[comp]) {
            if (tree_assign[u] == 1) {
                int target = a[u];
                int expected = (opt[u] == 1) ? 1 : 0;
                if (tree_assign[target] != expected) {
                    valid_tree = false;
                    break;
                }
            }
        }
        if (!valid_tree) continue;
        ll ways = 1;
        for (int i = 0; i < free_count; i++) {
            ways = (ways * 2) % MOD;
        }
        comp_count_val = (comp_count_val + ways) % MOD;
        comp_min_correct = min(comp_min_correct, total_correct);
        comp_max_correct = max(comp_max_correct, total_correct);
    }
    comp_total_count[comp] = comp_count_val;
    comp_global_min[comp] = comp_min_correct;
    comp_global_max[comp] = comp_max_correct;
}

int main() {
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        scanf("%d %d", &a[i], &opt[i]);
        a[i]--; 
    }
    for (int i = 0; i < n; i++) {
        parent[a[i]].push_back(i);
        in_degree[a[i]]++;
    }
    find_components();
    for (int i = 0; i < comp_count; i++) {
        process_component(i);
    }
    ll total_count = 1;
    int total_min = 0, total_max = 0;
    bool no_answer = false;
    for (int i = 0; i < comp_count; i++) {
        if (comp_total_count[i] == 0) {
            no_answer = true;
            break;
        }
        total_count = (total_count * comp_total_count[i]) % MOD;
        total_min += comp_global_min[i];
        total_max += comp_global_max[i];
    }
    if (no_answer) {
        printf("No answer\n");
    } else {
        printf("%lld\n", total_count);
        printf("%d\n", total_max);
        printf("%d\n", total_min);
    }
    return 0;
}