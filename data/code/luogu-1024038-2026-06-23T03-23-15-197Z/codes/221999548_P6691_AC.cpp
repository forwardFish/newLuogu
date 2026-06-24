#include <bits/stdc++.h>
using namespace std;
using ll = long long;
static const int MOD = 998244353;

// 快速幂 a^e mod
int mod_pow(int a, ll e) {
    ll r = 1, x = a;
    while (e) {
        if (e & 1) r = (r * x) % MOD;
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
    for(int i=1;i<=n;i++){
        cin >> a[i] >> opt[i];
        w[i] = 1 - opt[i];
    }
    // 逆邻接表
    vector<vector<int>> rev(n+1);
    for(int i=1;i<=n;i++) rev[a[i]].push_back(i);

    // 三色法找环
    vector<char> vis(n+1,0);
    vector<vector<int>> cycles;
    vector<int> stk; stk.reserve(n);

    for(int i=1;i<=n;i++){
        if(vis[i]) continue;
        int u=i; stk.clear();
        while(!vis[u]){
            vis[u]=1;
            stk.push_back(u);
            u=a[u];
        }
        if(vis[u]==1){
            vector<int> cyc;
            for(int j=stk.size()-1;j>=0;j--){
                cyc.push_back(stk[j]);
                if(stk[j]==u) break;
            }
            cycles.push_back(move(cyc));
        }
        for(int x:stk) vis[x]=2;
    }

    ll K = cycles.size(), min_sum=0, max_sum=0;
    vector<int> xval(n+1);
    // 时间戳法标记
    vector<int> tag(n+1,0);
    int curt=1;

    for(auto &cyc: cycles){
        // 环上 XOR 和
        int S=0;
        for(int u:cyc) S^=w[u];
        if(S==1){
            cout<<"No answer\n";
            return 0;
        }
        int local_min=INT_MAX, local_max=INT_MIN;
        // t=0/1 两次试
        for(int t=0;t<2;t++,curt++){
            int cnt=0;
            queue<int> q;
            // 环上传播(注意用 w[u] 而不是 w[p])
            xval[cyc[0]] = t;
            tag[cyc[0]] = curt;
            cnt += t;
            q.push(cyc[0]);
            int m=cyc.size();
            for(int i=1;i<m;i++){
                int u = cyc[i], p=cyc[i-1];
                // *** 这里用 w[u] ***
                xval[u] = xval[p] ^ w[u];
                tag[u] = curt;
                cnt += xval[u];
                q.push(u);
            }
            // 最后一条环边隐式保证一致

            // BFS 向下走树
            while(!q.empty()){
                int u=q.front();q.pop();
                for(int v: rev[u]){
                    if(tag[v]==curt) continue;
                    xval[v] = xval[u] ^ w[v];
                    tag[v] = curt;
                    cnt += xval[v];
                    q.push(v);
                }
            }
            local_min = min(local_min, cnt);
            local_max = max(local_max, cnt);
        }
        min_sum += local_min;
        max_sum += local_max;
    }

    int ways = mod_pow(2, K);
    cout<<ways<<"\n"<<max_sum<<"\n"<<min_sum<<"\n";
    return 0;
}
