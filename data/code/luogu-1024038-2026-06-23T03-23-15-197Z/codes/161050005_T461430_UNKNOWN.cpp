#include <iostream>
#include <vector>
#include <unordered_set>

#define MOD 998244353

using namespace std;

int main() {
    int n, m;
    cin >> n >> m;

    vector<pair<int, int>> minerals(n);
    for (int i = 0; i < n; ++i) {
        cin >> minerals[i].first >> minerals[i].second;
    }

    vector<int> mining_points(m);
    for (int i = 0; i < m; ++i) {
        cin >> mining_points[i];
    }

    // Using a set to store all unique combinations
    unordered_set<int> unique_combinations;

    // Iterate through each mining point
    for (int i = 0; i < m; ++i) {
        int point = mining_points[i];
        int combination = 0;

        // Check which minerals can be mined at this point
        for (int j = 0; j < n; ++j) {
            if (point >= minerals[j].first && point <= minerals[j].second) {
                combination |= (1 << j);
            }
        }

        // Add the combination to the set if it is non-zero
        if (combination != 0) {
            unique_combinations.insert(combination);
        }
    }

    // The number of unique combinations is the size of the set
    int result = unique_combinations.size();
    cout << result % MOD << endl;

    return 0;
}
