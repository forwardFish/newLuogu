#include <iostream>
#include <vector>
#include <algorithm>
#include <climits>

using namespace std;

int main() {
    int T;
    cin >> T;
    while (T--) {
        int n;
        cin >> n;
        vector<int> a(n);
        for (int i = 0; i < n; ++i) {
            cin >> a[i];
        }

        vector<int> dp(n, 0);  // dp[i] 表示解锁到第 i 个位置时能获得的最大金币数量
        vector<bool> unlocked(n, false);  // unlocked[i] 表示第 i 个位置是否被解锁
        unlocked[0] = true;

        for (int i = 0; i < n; ++i) {
            if (!unlocked[i]) break;  // 如果当前位置未被解锁，游戏结束
            dp[i] = max(dp[i], (i > 0 ? dp[i-1] : 0));
            if (a[i] > 0) {
                int next_unlock = min(i + a[i], n - 1);  // 下一个解锁的位置
                for (int j = i + 1; j <= next_unlock; ++j) {
                    unlocked[j] = true;
                }
            }
            if (i + 1 < n) {
                dp[i + 1] = max(dp[i + 1], dp[i] + a[i]);
            }
        }

        cout << dp[n-1] << endl;
    }
    return 0;
}
