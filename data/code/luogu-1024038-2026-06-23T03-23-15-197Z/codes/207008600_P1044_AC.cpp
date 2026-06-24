#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    long long dp[20] = {0};
    dp[0] = 1; // 初始条件，0个元素的情况数为1
    
    for (int i = 1; i <= n; ++i) {
        for (int k = 0; k < i; ++k) {
            dp[i] += dp[k] * dp[i - 1 - k];
        }
    }
    
    cout << dp[n];
    return 0;
}