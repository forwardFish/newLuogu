#include <iostream>
#include <queue>
#include <cstring>
using namespace std;

const int MAXN = 1005;
int n, m;
int grid[MAXN][MAXN];
bool visited[MAXN][MAXN];
int dx[] = {0, 0, 1, -1};
int dy[] = {1, -1, 0, 0};

bool bfs(int max_damage) {
    queue<pair<int, int>> q;
    memset(visited, false, sizeof(visited));
    
    // 初始化：将第1行的所有房间加入队列
    for (int j = 0; j < m; ++j) {
        q.push({0, j});
        visited[0][j] = true;
    }
    
    while (!q.empty()) {
        int x = q.front().first;
        int y = q.front().second;
        q.pop();
        
        // 如果到达第n行，返回true
        if (x == n - 1) return true;
        
        for (int i = 0; i < 4; ++i) {
            int nx = x + dx[i];
            int ny = y + dy[i];
            if (nx >= 0 && nx < n && ny >= 0 && ny < m && !visited[nx][ny] && grid[nx][ny] <= max_damage) {
                q.push({nx, ny});
                visited[nx][ny] = true;
            }
        }
    }
    
    return false;
}

int main() {
    cin >> n >> m;
    int max_val = 0;
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < m; ++j) {
            cin >> grid[i][j];
            max_val = max(max_val, grid[i][j]);
        }
    }
    
    int low = 0, high = max_val;
    int ans = max_val;
    
    while (low <= high) {
        int mid = (low + high) / 2;
        if (bfs(mid)) {
            ans = mid;
            high = mid - 1;
        } else {
            low = mid + 1;
        }
    }
    
    cout << ans << endl;
    return 0;
}
