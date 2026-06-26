#include <bits/stdc++.h>
using namespace std;

int main() {
    int r;
    cin >> r;

    vector<vector<int>> a(r + 1, vector<int>(r + 1, 0));
    vector<vector<int>> dp(r + 1, vector<int>(r + 1, 0));

    for (int i = 1; i <= r; i++) {
        for (int j = 1; j <= i; j++) {
            cin >> a[i][j];
        }
    }

    dp[1][1] = a[1][1];

    for (int i = 2; i <= r; i++) {
        for (int j = 1; j <= i; j++) {
            if (j == 1) {
                dp[i][j] = dp[i - 1][j] + a[i][j];
            } else if (j == i) {
                dp[i][j] = dp[i - 1][j - 1] + a[i][j];
            } else {
                dp[i][j] = max(dp[i - 1][j - 1], dp[i - 1][j]) + a[i][j];
            }
        }
    }

    int ans = 0;
    for (int j = 1; j <= r; j++) {
        ans = max(ans, dp[r][j]);
    }

    cout << ans << endl;
    return 0;
}