#include <iostream>
#include <cstring>
#include <algorithm>

using namespace std;

const int N = 10;
int grid[N][N], dp[N][N][N][N];

int main() {
    int n;
    cin >> n;

    memset(grid, 0, sizeof(grid));

    // 读取输入
    while (true) {
        int x, y, value;
        cin >> x >> y >> value;
        if (x == 0 && y == 0 && value == 0) break;
        grid[x][y] = value;
    }

    memset(dp, -1, sizeof(dp));
    dp[1][1][1][1] = grid[1][1]; // 从起点出发

    for (int x1 = 1; x1 <= n; ++x1) {
        for (int y1 = 1; y1 <= n; ++y1) {
            for (int x2 = 1; x2 <= n; ++x2) {
                for (int y2 = 1; y2 <= n; ++y2) {
                    // 当前坐标非法时跳过
                    if (x1 + y1 != x2 + y2) continue;
                    if (x1 > n || y1 > n || x2 > n || y2 > n) continue;

                    int &cur = dp[x1][y1][x2][y2];
                    cur = max({cur,
                        dp[x1-1][y1][x2-1][y2], // 两人均往下
                        dp[x1-1][y1][x2][y2-1], // 第一个往下, 第二个人往右
                        dp[x1][y1-1][x2-1][y2], // 第一个往右, 第二个往下
                        dp[x1][y1-1][x2][y2-1]  // 两人均往右
                    });

                    if (cur == -1) continue;

                    // 取得当前格子数和 (不能重复累计相同格)
                    cur += grid[x1][y1];
                    if (x1 != x2 || y1 != y2) cur += grid[x2][y2];
                }
            }
        }
    }

    cout << dp[n][n][n][n] << endl;
    return 0;
}
