#include <iostream>
#include <vector>
#include <unordered_set>
#include <string>
#include <climits>
using namespace std;
unordered_set<string> generatePowersOfTwo(int maxLength) {
    unordered_set<string> powersOfTwo;
    long long power = 1;
    while (true) {
        string powerStr = to_string(power);
        if (powerStr.length() > maxLength) break;
        powersOfTwo.insert(powerStr);
        power *= 2;
    }
    return powersOfTwo;
}

int minChangesToAvoidPowersOfTwo(string s) {
    int n = s.length();
    unordered_set<string> powersOfTwo = generatePowersOfTwo(n);
    vector<int> dp(n + 1, INT_MAX);
    dp[0] = 0;

    for (int i = 1; i <= n; ++i) {
        for (int j = i; j > 0; --j) {
            string sub = s.substr(j - 1, i - j + 1);
            if (powersOfTwo.find(sub) == powersOfTwo.end()) {
                dp[i] = min(dp[i], dp[j - 1] + (i - j + 1));
            }
        }
    }

    return dp[n];
}
int main() {
    string s;
    cin >> s;
    cout << minChangesToAvoidPowersOfTwo(s) << endl;
    return 0;
}
