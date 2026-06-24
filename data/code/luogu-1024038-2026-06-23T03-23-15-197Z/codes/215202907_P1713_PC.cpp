#include <bits/stdc++.h>
using namespace std;

int n, m;
bool obstacle[12][12];    // 障碍格标记
bool visited[12][12];     // DFS 访问标记
int stepCount[12][12];    // 当前路径上各格子的步数
int bestu[12][12];        // 存储最长路径经过时各格子的步数
int firstDist, bestMax, totalFree;

// 方向：右、上、下、左（对应题中坐标系）
int dx[4] = {1, 0,  0, -1};
int dy[4] = {0, 1, -1,  0};

// 检查坐标是否在 [1,n] 范围内
inline bool inBounds(int x, int y) {
    return x >= 1 && x <= n && y >= 1 && y <= n;
}

// BFS连通性检查：判断从 (sx,sy) 能否到达终点 (n,n)，
// 已访问和障碍格视为不可通过
bool reachable(int sx, int sy) {
    if (!inBounds(sx, sy) || visited[sx][sy] || obstacle[sx][sy]) return false;
    static bool used[12][12];
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++)
            used[i][j] = false;
    queue<pair<int,int>> q;
    q.push({sx, sy});
    used[sx][sy] = true;
    while (!q.empty()) {
        auto p = q.front(); q.pop();
        int x = p.first, y = p.second;
        if (x == n && y == n) return true;
        for (int d = 0; d < 4; d++) {
            int nx = x + dx[d], ny = y + dy[d];
            if (!inBounds(nx, ny) || used[nx][ny]) continue;
            if (visited[nx][ny] || obstacle[nx][ny]) continue;
            used[nx][ny] = true;
            q.push({nx, ny});
        }
    }
    return false;
}

// DFS 搜索最长路径
void dfs(int x, int y, int curStep) {
    // 如果已经达到理论最大步数，直接剪枝
    if (bestMax == totalFree - 1) return;
    // 剪枝：若当前步数超出最短路径且不超过已记录的最长路径值，跳过
    if (curStep > firstDist && curStep < bestu[x][y]) return;
    // 到达终点时更新最长步数
    if (x == n && y == n) {
        if (curStep > bestMax) {
            bestMax = curStep;
            // 记录当前路径上每个格子的步数，用于后续剪枝
            for (int i = 1; i <= n; i++)
                for (int j = 1; j <= n; j++)
                    bestu[i][j] = stepCount[i][j];
        }
        return;
    }
    // 按顺序探索四个方向：右、上、下、左
    for (int d = 0; d < 4; d++) {
        int nx = x + dx[d], ny = y + dy[d];
        if (!inBounds(nx, ny) || obstacle[nx][ny] || visited[nx][ny]) continue;
        // 如果邻近格就是终点，直接处理
        if (nx == n && ny == n) {
            visited[nx][ny] = true;
            stepCount[nx][ny] = curStep + 1;
            dfs(nx, ny, curStep + 1);
            visited[nx][ny] = false;
            stepCount[nx][ny] = 0;
            continue;
        }
        // 连通性剪枝
        if (!reachable(nx, ny)) continue;
        // 走向邻居格
        visited[nx][ny] = true;
        stepCount[nx][ny] = curStep + 1;
        dfs(nx, ny, curStep + 1);
        visited[nx][ny] = false;
        stepCount[nx][ny] = 0;
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n >> m;
    // 初始化障碍格
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++)
            obstacle[i][j] = false;
    for (int i = 0; i < m; i++) {
        int x, y;
        cin >> x >> y;
        if (x >= 1 && x <= n && y >= 1 && y <= n) {
            obstacle[x][y] = true;
        }
    }
    // 如果起点或终点被阻塞，无路径
    if (obstacle[1][1] || obstacle[n][n]) {
        cout << 0;
        return 0;
    }
    totalFree = n * n - m;  // 总共可走的格子数

    // BFS 找最短路径步数（边数）
    vector<vector<int>> dist(n+1, vector<int>(n+1, -1));
    queue<pair<int,int>> q;
    q.push({1,1});
    dist[1][1] = 0;
    while (!q.empty()) {
        auto p = q.front(); q.pop();
        int x = p.first, y = p.second;
        for (int d = 0; d < 4; d++) {
            int nx = x + dx[d], ny = y + dy[d];
            if (!inBounds(nx, ny) || obstacle[nx][ny] || dist[nx][ny] != -1) continue;
            dist[nx][ny] = dist[x][y] + 1;
            q.push({nx, ny});
        }
    }
    // 如果终点不可达，输出 0
    if (dist[n][n] == -1) {
        cout << 0;
        return 0;
    }
    firstDist = dist[n][n];
    bestMax = firstDist;
    // 初始化 剪枝记录数组
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++)
            bestu[i][j] = -1;
    // 开始 DFS
    memset(visited, 0, sizeof(visited));
    visited[1][1] = true;
    stepCount[1][1] = 0;
    dfs(1, 1, 0);
    // 输出最长步数与最短步数之差
    cout << bestMax - firstDist;
    return 0;
}
