#include <bits/stdc++.h>
using namespace std;

const int INF = INT_MAX / 3;
int dp[101][101], sum[102], n, x;

int main() {
    // 输入n的值
    scanf("%d", &n);
    // 计算前缀和
    for (int i = 1; i <= n; i++) {
        scanf("%d", &x);
        sum[i] = sum[i - 1] + x;
    }

    // 初始化dp数组
    for (int i = 1; i <= n; i++) {
        fill(dp[i], dp[i] + n + 1, INF);
        dp[i][i] = 0;
    }

    // 动态规划求解区间[i, j]的最小值
    for (int len = 2; len <= n; len++) { // 区间长度从2到n
        for (int i = 1; i <= n - len + 1; i++) { // 起始位置
            int j = i + len - 1; // 终止位置
            for (int k = i; k < j; k++) {
                dp[i][j] = min(dp[i][j], dp[i][k] + dp[k + 1][j] + sum[j] - sum[i - 1]);
            }
        }
    }

    // 输出结果
    printf("%d", dp[1][n]);
    return 0;
}
