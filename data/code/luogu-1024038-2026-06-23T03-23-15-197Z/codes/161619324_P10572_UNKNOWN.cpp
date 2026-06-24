#include <iostream>
#include <vector>
#include <string>
#include <stack>

using namespace std;

void dfs(int v, vector<vector<int>>& adj, vector<int>& component, int compID, string& chars, vector<int>& balance) {
    stack<int> s;
    s.push(v);
    component[v] = compID;
    
    while (!s.empty()) {
        int u = s.top();
        s.pop();
        
        for (int neighbor : adj[u]) {
            if (component[neighbor] == -1) {
                component[neighbor] = compID;
                s.push(neighbor);
            }
        }
        
        if (chars[u] == '(') balance[compID]++;
        else balance[compID]--;
    }
}

bool isValidComponent(int balance) {
    return balance == 0;
}

int main() {
    int n, m, q;
    cin >> n >> m >> q;
    
    string chars;
    cin >> chars;
    
    vector<vector<int>> adj(n);
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        --u; --v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    
    vector<int> component(n, -1);
    vector<int> balance(n, 0);
    int compID = 0;
    
    for (int i = 0; i < n; i++) {
        if (component[i] == -1) {
            dfs(i, adj, component, compID, chars, balance);
            compID++;
        }
    }
    
    string result;
    for (int i = 0; i < q; i++) {
        int x, y;
        cin >> x >> y;
        --x; --y;
        
        if (component[x] != component[y]) {
            result += '0';
        } else {
            if (isValidComponent(balance[component[x]])) {
                result += '1';
            } else {
                result += '0';
            }
        }
    }
    
    cout << result << endl;
    
    return 0;
}
