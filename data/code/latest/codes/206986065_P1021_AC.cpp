#include <iostream>
#include <vector>
#include <climits>
#include <algorithm>

using namespace std;

int N, K;
vector<int> best_stamps;
int max_total = 0;

int calculate_max(const vector<int>& stamps, int N) {
    vector<int> dp(1, 0); // dp[0] = 0
    int i = 1;
    while (true) {
        dp.push_back(INT_MAX);
        for (int v : stamps) {
            if (i >= v && dp[i - v] != INT_MAX) {
                dp[i] = min(dp[i], dp[i - v] + 1);
            }
        }
        if (dp[i] > N) {
            return i - 1;
        }
        i++;
    }
}

void backtrack(vector<int>& current_stamps) {
    if (current_stamps.size() == K) {
        int current_max = calculate_max(current_stamps, N);
        if (current_max > max_total) {
            max_total = current_max;
            best_stamps = current_stamps;
        }
        return;
    }

    int current_max = calculate_max(current_stamps, N);
    int v_prev = current_stamps.back();
    int start = v_prev + 1;
    int end = current_max + 1;

    for (int c = end; c >= start; --c) { // 逆序尝试更大的面值优先
        current_stamps.push_back(c);
        backtrack(current_stamps);
        current_stamps.pop_back();
    }
}

int main() {
    cin >> N >> K;
    vector<int> initial;
    initial.push_back(1);

    if (K == 1) {
        best_stamps = initial;
        max_total = N;
    } else {
        backtrack(initial);
    }

    for (size_t i = 0; i < best_stamps.size(); ++i) {
        if (i > 0) cout << ' ';
        cout << best_stamps[i];
    }
    cout << endl << "MAX=" << max_total << endl;

    return 0;
}