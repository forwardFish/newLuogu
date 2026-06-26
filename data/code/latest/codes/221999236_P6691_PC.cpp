#include <bits/stdc++.h>
using namespace std;
using ll = long long;
static const int MOD = 998244353;

int mod_pow(int a, ll e){
    ll r = 1, x = a;
    while(e){
        if(e & 1) r = (r * x) % MOD;
        x = (x * x) % MOD;
        e >>= 1;
    }
    return int(r);
}

int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;
    vector<int> a(n+1), opt(n+1), w(n+1);
    for(int i = 1; i <= n; i++){
        cin >> a[i] >> opt[i];
        w[i] = 1 - opt[i];
    }
    // 逆边：从 u 能走到哪些 i，使得 a[i] = u
    vector<vector<int>> rev(n+1);
    for(int i = 1; i <= n; i++){
        rev[a[i]].push_back(i);
    }

    // 三色标记找环：0=未访问,1=在栈,2=完成
    vector<char> vis(n+1, 0);
    vector<vector<int>> cycles;
    vector<int> stk;
    stk.reserve(n);

    for(int i = 1; i <= n; i++){
        if(vis[i]) continue;
        int u = i;
        stk.clear();
        while(!vis[u]){
            vis[u] = 1;
            stk.push_back(u);
            u = a[u];
        }
        if(vis[u] == 1){
            // u 在当前stk里，回退提取环
            vector<int> cyc;
            for(int j = (int)stk.size()-1; j >= 0; j--){
                cyc.push_back(stk[j]);
                if(stk[j] == u) break;
            }
            cycles.push_back(move(cyc));
        }
        // 整条路径标为完成
        for(int x: stk) vis[x] = 2;
    }

    ll total_cycles = cycles.size();
    ll min_sum = 0, max_sum = 0;
    vector<int> xval(n+1);

    for(auto &cyc: cycles){
        // 1) 检 S = XOR w 环上所有边
        int S = 0;
        for(int u: cyc) S ^= w[u];
        if(S == 1){
            cout << "No answer\n";
            return 0;
        }

        int best0 = INT_MAX, best1 = INT_MIN;
        // 对 t=0 和 t=1 分别传播
        for(int t = 0; t <= 1; t++){
            // 每轮都用独立的 used2 数组
            vector<char> used2(n+1, 0);
            int cnt = 0;
            // 1. 环上传播
            int m = cyc.size();
            xval[cyc[0]] = t;
            used2[cyc[0]] = 1;
            cnt += t;
            for(int i = 1; i < m; i++){
                int u = cyc[i], prev = cyc[i-1];
                xval[u] = xval[prev] ^ w[prev];
                used2[u] = 1;
                cnt += xval[u];
            }
            // 最后一条边检查 & 传播（更健壮）
            {
                int u = cyc[0], prev = cyc[m-1];
                int expect = xval[prev] ^ w[prev];
                // S==0 保证 expect == t
                // 不用再赋值给 xval[u]，但写上以示完整：
                // xval[u] = expect;
            }

            // 2. 从环上所有节点出发，向下沿 rev 做 BFS
            queue<int> q;
            for(int u: cyc) q.push(u);
            while(!q.empty()){
                int u = q.front(); q.pop();
                for(int v: rev[u]){
                    if(used2[v]) continue;
                    // a[v] = u，方程 x[u] XOR x[v] = w[v]
                    xval[v] = xval[u] ^ w[v];
                    used2[v] = 1;
                    cnt += xval[v];
                    q.push(v);
                }
            }

            // 更新本分量 t=0/1 下最小最大
            best0 = min(best0, cnt);
            best1 = max(best1, cnt);
        }

        // 累加全局
        min_sum += best0;
        max_sum += best1;
    }

    // 合法解总数 = 2^total_cycles mod
    int ways = mod_pow(2, total_cycles);
    cout << ways << "\n"
         << max_sum << "\n"
         << min_sum << "\n";
    return 0;
}
