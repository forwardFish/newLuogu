#include <iostream>
#include <cstring>
using namespace std;
int main() {
    int n;
    cin >> n;
    int dp[11][5001]
    memset(dp, 0, sizeof(dp));
    dp[0][0] = 1;

    for (int i = 1; i <= 10; ++i) {
        for (int j = 0; j <= n; ++j) {
            for (int k = 1; k <= 3 && k <= j; ++k) {
                dp[i][j] += dp[i - 1][j - k];
            }
        }
    }

    if (dp[10][n] == 0) {
        cout << "0" << endl;
    } else {
        cout << dp[10][n] << endl;
        for (int i = 1; i <= 10; ++i) {
            for (int j = 1; j <= 3; ++j) {
                if (n - j >= 0 && dp[i - 1][n - j] > 0) {
                    cout << j << " ";
                    n -= j;
                    break;
                }
            }
        }
        cout << endl;
    }

    return 0;
}
