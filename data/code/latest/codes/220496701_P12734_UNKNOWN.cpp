#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const ll INF = (1LL<<60);

int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int T; cin >> T;
    while(T--){
        int n,m,k;
        cin >> n >> m >> k;
        vector<int> p(n+1);
        for(int i=1;i<=n;i++) cin >> p[i];
        vector<ll> r(n+1), t(n+1);
        for(int i=1;i<=n;i++) cin >> r[i];
        for(int i=1;i<=n;i++) cin >> t[i];
        vector<int> x(m);
        for(int i=0;i<m;i++) cin >> x[i];
        
        // build tree
        vector<vector<int>> ch(n+1);
        int rootCnt=0;
        for(int i=1;i<=n;i++){
            if(p[i]>0) ch[p[i]].push_back(i);
            else rootCnt++;
        }
        
        // LCA prep: depth + 2^j ancestors
        int LOG = 18;
        vector<vector<int>> up(LOG, vector<int>(n+1,0));
        vector<int> depth(n+1,0);
        
        // dfs from all roots
        function<void(int)> dfs = [&](int u){
            for(int v: ch[u]){
                depth[v] = depth[u] + 1;
                up[0][v] = u;
                dfs(v);
            }
        };
        for(int i=1;i<=n;i++) if(p[i]==0) dfs(i);
        for(int j=1;j<LOG;j++){
            for(int i=1;i<=n;i++){
                up[j][i] = up[j-1][ up[j-1][i] ];
            }
        }
        auto lca = [&](int u, int v){
            if(u==0||v==0) return u+v;
            if(depth[u]<depth[v]) swap(u,v);
            int d = depth[u]-depth[v];
            for(int j=0;j<LOG;j++) if(d>>j &1) u = up[j][u];
            if(u==v) return u;
            for(int j=LOG-1;j>=0;j--){
                if(up[j][u]!=up[j][v]){
                    u=up[j][u]; v=up[j][v];
                }
            }
            return up[0][u];
        };
        
        vector<char> solved(n+1,0);
        deque<int> dq;
        ll total = 0;
        
        for(int v: x){
            if(solved[v]) continue;
            if(dq.empty()){
                // no memory, must recall
                total += r[v];
                dq.push_back(v);
            } else {
                int cur = dq.back();
                int w = lca(cur, v);
                // backtrack pop until back == w
                while(!dq.empty() && dq.back() != w){ dq.pop_back(); }
                // build path from w to v (excluding w)
                vector<int> path;
                int u = v;
                while(u != w){ path.push_back(u); u = p[u]; }
                reverse(path.begin(), path.end());
                int need = path.size();
                // sum t on path
                ll cost_link = 0;
                for(int node: path) cost_link += t[node];
                // pops needed
                int pops = max(0, (int)dq.size() + need - k);
                // option recall
                ll cost_rec = r[v];
                if(cost_rec <= cost_link){
                    // recall better
                    total += cost_rec;
                    dq.clear(); dq.push_back(v);
                } else {
                    // link
                    total += cost_link;
                    while(pops--) dq.pop_front();
                    for(int node: path) dq.push_back(node);
                }
            }
            solved[v] = 1;
        }
        cout << total << "\n";
    }
    return 0;
}
