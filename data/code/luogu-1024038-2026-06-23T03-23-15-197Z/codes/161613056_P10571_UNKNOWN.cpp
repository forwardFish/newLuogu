#include <iostream>
#include <unordered_set>
#include <vector>
#include <string>

using namespace std;

// Function to generate all powers of 2 up to 2^30 as strings
unordered_set<string> generatePowerOfTwoStrings() {
    unordered_set<string> powerOfTwoStrings;
    for (int i = 0; i <= 30; ++i) {
        powerOfTwoStrings.insert(to_string(1LL << i));
    }
    return powerOfTwoStrings;
}

// Function to determine the minimum number of modifications
int minModifications(string s, const unordered_set<string>& powerOfTwoStrings) {
    int n = s.length();
    vector<int> dp(n + 1, 0);
    
    for (int i = 1; i <= n; ++i) {
        dp[i] = dp[i - 1] + 1;  // Assume we modify the current character
        for (int len = 1; len <= i; ++len) {
            string sub = s.substr(i - len, len);
            if (powerOfTwoStrings.find(sub) != powerOfTwoStrings.end()) {
                dp[i] = min(dp[i], dp[i - len] + len);
            }
        }
    }
    
    return dp[n];
}

int main() {
    string s;
    cin >> s;
    
    unordered_set<string> powerOfTwoStrings = generatePowerOfTwoStrings();
    
    int result = minModifications(s, powerOfTwoStrings);
    
    cout << result << endl;
    
    return 0;
}
