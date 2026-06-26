#include <bits/stdc++.h>
using namespace std;

int n, m;
bool obstacle[11][11];    // 标记障碍格
bool visited_cell[11][11]; // 标记走过的格子
int minSteps, maxSteps;

// 四个方向：右、左、上、下
int dx[4] = {1, -1, 0, 0};
int dy[4] = {0, 0, 1, -1};

// 深度优先搜索：从 (x,y) 出发，当前已走 steps 步
void dfs(int x, int y, int steps) {
    // 如果到达终点 (n,n)，更新最小/最大步数
    if (x == n && y == n) {
        minSteps = min(minSteps, steps);
        maxSteps = max(maxSteps, steps);
        return;
    }
    // 枚举四个方向的下一步
    for (int i = 0; i < 4; i++) {
        int nx = x + dx[i];
        int ny = y + dy[i];
        // 边界检查
        if (nx < 1 || nx > n || ny < 1 || ny > n) continue;
        // 障碍或已访问则跳过
        if (obstacle[nx][ny] || visited_cell[nx][ny]) continue;
        // 访问下一个格子
        visited_cell[nx][ny] = true;
        dfs(nx, ny, steps + 1);
        // 回溯，恢复访问状态
        visited_cell[nx][ny] = false;
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(NULL);

    cin >> n >> m;
    // 初始化障碍和访问数组
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            obstacle[i][j] = false;
            visited_cell[i][j] = false;
        }
    }
    // 读入障碍格位置并标记
    for (int i = 0; i < m; i++) {
        int x, y;
        cin >> x >> y;
        if (x >= 1 && x <= n && y >= 1 && y <= n) {
            obstacle[x][y] = true;
        }
    }
    // 如果起点或终点是障碍，则无路径
    if (obstacle[1][1] || obstacle[n][n]) {
        cout << 0;
        return 0;
    }
    // 初始化最小和最大步数
    minSteps = INT_MAX;
    maxSteps = -1;
    // 从起点开始DFS，初始步数为0
    visited_cell[1][1] = true;
    dfs(1, 1, 0);
    // 输出结果：若未找到任何路径，则差值为0
    if (minSteps == INT_MAX) {
        cout << 0;
    } else {
        cout << (maxSteps - minSteps);
    }
    return 0;
}
