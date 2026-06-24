#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int N;
    cin >> N;

    // 初始化方格
    vector<vector<int>> grid(N, vector<int>(N, 0));
    while (true) {
        int x, y, val;
        cin >> x >> y >> val;
        if (x == 0 && y == 0 && val == 0) break;
        grid[x - 1][y - 1] = val; // 转换为0索引
    }

    // 动态规划数组 dp[k][i][j]
    // k: 当前步数, i: 第一条路径的行号, j: 第二条路径的行号
    vector<vector<vector<int>>> dp(2 * N, vector<vector<int>>(N, vector<int>(N, 0)));

    for (int k = 1; k <= 2 * N - 2; ++k) { // 遍历步数
        for (int i1 = 0; i1 < N; ++i1) { // 第一条路径的行号
            for (int i2 = 0; i2 < N; ++i2) { // 第二条路径的行号
                int j1 = k - i1, j2 = k - i2; // 计算列号
                if (j1 < 0 || j1 >= N || j2 < 0 || j2 >= N) continue; // 越界检查

                // 四种转移方式
                int maxPrev = 0;
                maxPrev = max(maxPrev, dp[k - 1][i1][i2]);       // 两条路径都从上方来
                if (i1 > 0) maxPrev = max(maxPrev, dp[k - 1][i1 - 1][i2]); // 第一条从左来
                if (i2 > 0) maxPrev = max(maxPrev, dp[k - 1][i1][i2 - 1]); // 第二条从左来
                if (i1 > 0 && i2 > 0) maxPrev = max(maxPrev, dp[k - 1][i1 - 1][i2 - 1]); // 两条都从左来

                dp[k][i1][i2] = maxPrev + grid[i1][j1];
                if (i1 != i2) dp[k][i1][i2] += grid[i2][j2]; // 避免重复取数
            }
        }
    }

    // 输出结果
    cout << dp[2 * N - 2][N - 1][N - 1] << endl;
    return 0;
}