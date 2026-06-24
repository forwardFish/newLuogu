#include <iostream>
#include <vector>
#include <algorithm>
#include <set>
#include <map>
#include <queue>

using namespace std;

typedef pair<int, int> pii;

const int dx[] = {-1, 1, 0, 0};
const int dy[] = {0, 0, -1, 1};

bool isConnected(int n, int m, const set<pii>& grasshoppers) {
    if (grasshoppers.empty()) return false;
    set<pii> visited;
    queue<pii> q;
    q.push(*grasshoppers.begin());
    visited.insert(*grasshoppers.begin());
    while (!q.empty()) {
        pii current = q.front();
        q.pop();
        for (int i = 0; i < 4; ++i) {
            int nx = current.first + dx[i];
            int ny = current.second + dy[i];
            if (nx >= 1 && nx <= n && ny >= 1 && ny <= m) {
                pii neighbor = {nx, ny};
                if (grasshoppers.count(neighbor) && !visited.count(neighbor)) {
                    visited.insert(neighbor);
                    q.push(neighbor);
                }
            }
        }
    }
    return visited.size() == grasshoppers.size();
}

int main() {
    int T;
    cin >> T;
    while (T--) {
        int n, m, c;
        cin >> n >> m >> c;
        set<pii> grasshoppers;
        for (int i = 0; i < c; ++i) {
            int x, y;
            cin >> x >> y;
            grasshoppers.insert({x, y});
        }
        if (grasshoppers.size() <= 1) {
            cout << -1 << endl;
            continue;
        }
        if (!isConnected(n, m, grasshoppers)) {
            cout << 0 << endl;
            continue;
        }
        int minReplace = 2;
        for (auto& gh : grasshoppers) {
            set<pii> temp = grasshoppers;
            temp.erase(gh);
            if (!isConnected(n, m, temp)) {
                minReplace = 1;
                break;
            }
        }
        cout << minReplace << endl;
    }
    return 0;
}