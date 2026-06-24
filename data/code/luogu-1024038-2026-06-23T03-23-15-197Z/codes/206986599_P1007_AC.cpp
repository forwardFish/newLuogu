#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    int L, N;
    cin >> L >> N;
    if (N == 0) {
        cout << "0 0" << endl;
        return 0;
    }
    vector<int> positions(N);
    for (int i = 0; i < N; ++i) {
        cin >> positions[i];
    }
    int min_time = 0, max_time = 0;
    for (int x : positions) {
        int current_min = min(x, L + 1 - x);
        int current_max = max(x, L + 1 - x);
        if (current_min > min_time) {
            min_time = current_min;
        }
        if (current_max > max_time) {
            max_time = current_max;
        }
    }
    cout << min_time << " " << max_time << endl;
    return 0;
}