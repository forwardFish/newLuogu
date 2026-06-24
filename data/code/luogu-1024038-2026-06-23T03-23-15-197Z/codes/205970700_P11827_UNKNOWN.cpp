#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    int n, k, e;
    cin >> n >> k >> e;
    
    unordered_set<int> holes;
    for (int i = 0; i < n; ++i) {
        int a;
        cin >> a;
        holes.insert(a);
    }
    
    vector<int> s(k);
    for (int i = 0; i < k; ++i) {
        cin >> s[i];
    }
    sort(s.rbegin(), s.rend()); // 降序排列步法
    
    if (holes.count(0)) { // 起点是坑洞
        cout << -1 << endl;
        return 0;
    }
    
    vector<int> pre(e + 1, -1); // 前驱位置
    vector<int> step(e + 1, -1); // 使用的步法索引
    queue<int> q;
    q.push(0);
    pre[0] = 0;
    
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        
        if (u == e) break;
        
        for (int i = 0; i < k; ++i) {
            int v = u + s[i];
            if (v > e || holes.count(v)) continue;
            if (pre[v] == -1) {
                pre[v] = u;
                step[v] = i;
                q.push(v);
            }
        }
    }
    
    if (pre[e] == -1) {
        cout << -1 << endl;
        return 0;
    }
    
    vector<int> path;
    int current = e;
    while (current != 0) {
        path.push_back(current);
        current = pre[current];
    }
    path.push_back(0);
    reverse(path.begin(), path.end());
    
    cout << path.size() - 1 << '\n';
    for (size_t i = 1; i < path.size(); ++i) {
        cout << path[i] << " \n"[i == path.size() - 1];
    }
    
    return 0;
}