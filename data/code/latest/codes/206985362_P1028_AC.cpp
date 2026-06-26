#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;

    // dp[i] 表示数 i 的合法数列数目
    vector<int> dp(n + 1, 0);
    // sum_dp[i] 表示从 1 到 i 的所有 dp 值的和
    vector<int> sum_dp(n + 1, 0);

    for (int i = 1; i <= n; i++) {
        int half = i / 2;
        // dp[i] = 1 (自身) + sum_dp[half] (所有可能的后续数列)
        dp[i] = 1 + sum_dp[half];
        // 更新前缀和
        sum_dp[i] = sum_dp[i - 1] + dp[i];
    }

    // 输出结果
    cout << dp[n] << endl;
    return 0;
}