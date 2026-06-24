#include <bits/stdc++.h>
using namespace std;
using ll = long long;
static const int MOD = 998244353;

// 快速幂计算 a^e mod
int mod_pow(int a, ll e) {
    ll r = 1, x = a;
    while (e) {
        if (e & 1) r = (r * x) % MOD;
        x = (x * x) % MOD;
        e >>= 1;
    }
    return int(r);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;
    vector<int> a(n+1), opt(n+1), w(n+1);
    for (int i = 1; i <= n; i++) {
        cin >> a[i] >> opt[i];
        w[i] = 1 - opt[i];  // w[i] = x[i] XOR x[a[i]]
    }

    // 逆边列表：rev[u] 存储所有 v 使得 a[v] = u
    vector<vector<int>> rev(n+1);
    for (int i = 1; i <= n; i++) {
        rev[a[i]].push_back(i);
    }

    // 三色标记找环：0=未访问，1=在栈中，2=完成
    vector<char> vis(n+1, 0);
    vector<vector<int>> cycles;
    vector<int> stk;
    stk.reserve(n);

    for (int i = 1; i <= n; i++) {
        if (vis[i]) continue;
        stk.clear();
        int u = i;
        // 沿 a[] 指针走，直到遇到已访问节点
        while (!vis[u]) {
            vis[u] = 1;
            stk.push_back(u);
            u = a[u];
        }
        if (vis[u] == 1) {
            // u 在当前栈中，提取环节点
            vector<int> cyc;
            for (int j = stk.size() - 1; j >= 0; j--) {
                cyc.push_back(stk[j]);
                if (stk[j] == u) break;
            }
            cycles.push_back(move(cyc));
        }
        // 标记整个路径为完成
        for (int x : stk) vis[x] = 2;
    }

    ll total_cycles = cycles.size();
    ll min_sum = 0, max_sum = 0;
    vector<int> xval(n+1);

    // 时间戳法清空标记
    vector<int> vis_time(n+1, 0);
    int cur_time = 1;

    for (auto &cyc : cycles) {
        // 1) 先算环上的 XOR 和 S
        int S = 0;
        for (int u : cyc) S ^= w[u];
        if (S == 1) {
            cout << "No answer\n";
            return 0;
        }

        // 对 t = 0/1 两种假设分别 BFS
        int best_min = INT_MAX, best_max = INT_MIN;
        for (int t = 0; t <= 1; t++, cur_time++) {
            int cnt = 0;
            queue<int> q;

            // 环上传播
            xval[cyc[0]] = t;
            vis_time[cyc[0]] = cur_time;
            cnt += t;
            q.push(cyc[0]);
            int m = cyc.size();
            for (int i = 1; i < m; i++) {
                int u = cyc[i], p = cyc[i-1];
                xval[u] = xval[p] ^ w[p];
                vis_time[u] = cur_time;
                cnt += xval[u];
                q.push(u);
            }
            // 最后一条环边隐式一致（S==0 保证）

            // BFS 向下遍历树枝
            while (!q.empty()) {
                int u = q.front(); q.pop();
                for (int v : rev[u]) {
                    if (vis_time[v] == cur_time) continue;
                    xval[v] = xval[u] ^ w[v];
                    vis_time[v] = cur_time;
                    cnt += xval[v];
                    q.push(v);
                }
            }

            best_min = min(best_min, cnt);
            best_max = max(best_max, cnt);
        }

        min_sum += best_min;
        max_sum += best_max;
    }

    // 合法答案数 = 2^total_cycles mod
    int ways = mod_pow(2, total_cycles);
    cout << ways << "\n"
         << max_sum << "\n"
         << min_sum << "\n";

    return 0;
}
