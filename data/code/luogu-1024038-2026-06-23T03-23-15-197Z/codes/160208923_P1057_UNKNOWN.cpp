#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;

    // dp[i][j] 表示从第 i 个同学开始，传 j 次球回到第 i 个同学的方法数
    vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));

    // 初始化：传 0 次球回到自己手里，只有一种方法
    for (int i = 1; i <= n; ++i) {
        dp[i][0] = 1;
    }

    // 动态规划
    for (int j = 1; j <= m; ++j) {
        for (int i = 1; i <= n; ++i) {
            // 左边的同学
            int left = (i == 1) ? n : i - 1;
            // 右边的同学
            int right = (i == n) ? 1 : i + 1;
            // 状态转移
            dp[i][j] = dp[left][j - 1] + dp[right][j - 1];
        }
    }

    // 输出从第 1 个同学开始传 m 次球回到第 1 个同学的方法数
    cout << dp[1][m] << endl;

    return 0;
}
