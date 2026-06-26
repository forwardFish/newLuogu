#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

class UnionFind {
public:
    vector<int> parent, rank;
    
    UnionFind(int n) {
        parent.resize(n);
        rank.resize(n, 0);
        for(int i = 0; i < n; ++i) {
            parent[i] = i;
        }
    }
    
    int find(int u) {
        if(parent[u] != u) {
            parent[u] = find(parent[u]);
        }
        return parent[u];
    }
    
    void unite(int u, int v) {
        int rootU = find(u);
        int rootV = find(v);
        if(rootU != rootV) {
            if(rank[rootU] > rank[rootV]) {
                parent[rootV] = rootU;
            } else if(rank[rootU] < rank[rootV]) {
                parent[rootU] = rootV;
            } else {
                parent[rootV] = rootU;
                rank[rootU]++;
            }
        }
    }
};

int main() {
    int n, m, q;
    cin >> n >> m >> q;
    
    vector<pair<int, int>> edges(m);
    for(int i = 0; i < m; ++i) {
        cin >> edges[i].first >> edges[i].second;
        edges[i].first--;
        edges[i].second--;
    }
    
    vector<int> queries(q);
    for(int i = 0; i < q; ++i) {
        cin >> queries[i];
        queries[i]--;
    }
    
    vector<int> a(n, 0); // 重要值初始化为0
    vector<int> active(n, 0); // 标记当前城市是否为重点发展城市
    vector<int> answer(q); // 存储每次规划后的答案
    
    UnionFind uf(n);
    
    for(auto& e : edges) {
        uf.unite(e.first, e.second);
    }
    
    int activeCount = 0;
    
    for(int i = q - 1; i >= 0; --i) {
        int city = queries[i];
        if(a[city] == 0) {
            a[city] = 1;
            activeCount++;
            active[city] = 1;
        } else {
            a[city] = 0;
            activeCount--;
            active[city] = 0;
        }
        
        UnionFind uf_tmp(n);
        
        for(int j = 0; j < m; ++j) {
            int u = edges[j].first;
            int v = edges[j].second;
            if(active[u] && active[v]) {
                uf_tmp.unite(u, v);
            }
        }
        
        int count = 0;
        for(int j = 0; j < n; ++j) {
            if(!active[j]) {
                bool valid = true;
                for(int k = 0; k < n; ++k) {
                    if(active[k]) {
                        if(uf_tmp.find(j) == uf_tmp.find(k)) {
                            valid = false;
                            break;
                        }
                    }
                }
                if(valid) {
                    count++;
                }
            }
        }
        answer[i] = count;
    }
    
    for(int i = 0; i < q; ++i) {
        cout << answer[i] << endl;
    }
    
    return 0;
}
n