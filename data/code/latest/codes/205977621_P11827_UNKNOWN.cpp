#include <bits/stdc++.h>
using namespace std;

struct State {
    vector<int> cnt;
    int prev;
    int step;
};

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
    sort(s.rbegin(), s.rend()); // 步法降序排列
    
    if (holes.count(0)) {
        cout << -1 << '\n';
        return 0;
    }
    
    vector<State> best(e + 1);
    for (auto& st : best) {
        st.cnt.resize(k, -1); // 初始化为-1表示未访问
        st.prev = -1;
    }
    best[0].cnt.assign(k, 0);
    best[0].prev = -1;
    
    queue<int> q;
    q.push(0);
    
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        
        if (u == e) break;
        
        for (int i = 0; i < k; ++i) {
            int step = s[i];
            int v = u + step;
            if (v > e || holes.count(v)) continue;
            
            // 生成新的次数数组
            vector<int> new_cnt = best[u].cnt;
            new_cnt[i]++;
            
            // 比较新状态是否更优
            bool better = false;
            if (best[v].cnt[0] == -1) {
                better = true;
            } else {
                for (int j = 0; j < k; ++j) {
                    if (new_cnt[j] > best[v].cnt[j]) {
                        better = true;
                        break;
                    } else if (new_cnt[j] < best[v].cnt[j]) {
                        break;
                    }
                }
            }
            
            if (better) {
                best[v].cnt = new_cnt;
                best[v].prev = u;
                best[v].step = i;
                q.push(v);
            }
        }
    }
    
    if (best[e].cnt[0] == -1) {
        cout << -1 << '\n';
        return 0;
    }
    
    // 回溯路径
    vector<int> path;
    int current = e;
    while (current != 0) {
        path.push_back(current);
        current = best[current].prev;
    }
    path.push_back(0);
    reverse(path.begin(), path.end());
    
    cout << path.size() - 1 << '\n';
    for (size_t i = 1; i < path.size(); ++i) {
        cout << path[i] << " \n"[i == path.size() - 1];
    }
    
    return 0;
}
