#include <bits/stdc++.h>
using namespace std;
using ll = long long;
static const int MOD = 998244353;

int add(int a,int b){ a+=b; if(a>=MOD) a-=MOD; return a; }
int mul(ll a,ll b){ return int((a*b)%MOD); }
int mod_pow(int a, ll e=MOD-2){
    ll r=1, x=a;
    while(e){
        if(e&1) r = (r*x)%MOD;
        x = (x*x)%MOD;
        e >>= 1;
    }
    return int(r);
}

int main(){
    ios::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    cin >> n;
    vector<int> a(n+1), opt(n+1), w(n+1);
    for(int i=1;i<=n;i++){
        cin >> a[i] >> opt[i];
        w[i] = 1 - opt[i];
    }
    // 逆边列表，用来从环往树传播
    vector<vector<int>> rev(n+1);
    for(int i=1;i<=n;i++){
        rev[a[i]].push_back(i);
    }

    // 1=visiting, 2=done
    vector<char> vis(n+1, 0);
    vector<vector<int>> cycles;

    // 检测所有环（功能图出度=1）
    for(int i=1;i<=n;i++){
        if(vis[i]) continue;
        int u = i;
        // 路径记录
        vector<int> stk;
        while(!vis[u]){
            vis[u] = 1;
            stk.push_back(u);
            u = a[u];
        }
        if(vis[u]==1){
            // u 在当前栈里 ⇒ 找出环
            vector<int> cyc;
            // 从后往前找到 u 开始的位置
            for(int j = int(stk.size())-1; j>=0; j--){
                cyc.push_back(stk[j]);
                if(stk[j]==u) break;
            }
            cycles.push_back(cyc);
        }
        // 标记整个路径为完成
        for(int x: stk) vis[x] = 2;
    }

    ll total_cycles = cycles.size();
    ll min_sum = 0, max_sum = 0;

    // 对每个环分量做可行性检查与计数
    vector<char> used(n+1, 0);
    function<int(int)> bfs_count = [&](int root){
        // 广度遍历 tree 部分，count 1 的个数
        queue<int> q;
        q.push(root);
        used[root] = 1;
        int cnt = 0;
        while(!q.empty()){
            int u = q.front(); q.pop();
            cnt += (u>0 && used[u]==1 ? (used[u]==2?0:0) : 0); 
            // 实际节点值按 xval[u] 储存在 used[u]>=2? encoded:? 
            // —— 为简洁，下文改成专门数组存 xval。
        }
        return cnt;
    };

    // 为简洁，下面我们直接给出「传播并计数」的伪码版，实际比赛请写成迭代 BFS/DFS
    vector<int> xval(n+1);
    for(auto &cyc: cycles){
        // 计算环上 S
        int S = 0;
        for(int u: cyc) S ^= w[u];
        if(S==1){
            cout << "No answer\n";
            return 0;
        }
        // 准备 BFS 时擦除 used 标记
        for(int u: cyc) used[u] = 0;
        // 分别 t=0/1 做两次传播
        int cnt0 = 0, cnt1 = 0;
        for(int t=0;t<=1;t++){
            // 环上值先按 t 传播
            int m = cyc.size();
            for(int i=0;i<m;i++){
                int u = cyc[i];
                if(i==0){
                    xval[u] = t;
                } else {
                    int prev = cyc[i-1];
                    // prev -> u 对应方程 x[u] = x[prev] XOR w[prev]
                    xval[u] = xval[prev] ^ w[prev];
                }
            }
            // 最后还要从 cyc[m-1] -> cyc[0] 的那条边再验证并传播（其实环上一致，S=0 保证）
            // 并把环上节点都算进 cnt
            int &cnt = (t==0 ? cnt0 : cnt1);
            cnt = 0;
            for(int u: cyc){
                cnt += xval[u];
                used[u] = 1;
            }
            // 再把所有环上节点入队，向下走「反向树」
            queue<int> q;
            for(int u: cyc) q.push(u);

            while(!q.empty()){
                int u = q.front(); q.pop();
                for(int v: rev[u]){
                    if(used[v]) continue; // 已定
                    // v -> u 原边给出 x[u] XOR x[v] = w[v]
                    xval[v] = xval[u] ^ w[v];
                    used[v] = 1;
                    cnt += xval[v];
                    q.push(v);
                }
            }
        }
        // 累加 min/max
        min_sum += min(cnt0, cnt1);
        max_sum += max(cnt0, cnt1);
    }

    // 2^K mod
    int ans_cnt = mod_pow(2, total_cycles);

    cout << ans_cnt << "\n"
         << max_sum  << "\n"
         << min_sum  << "\n";
    return 0;
}
