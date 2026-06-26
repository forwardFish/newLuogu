#include <iostream>
#include <vector>

using namespace std;

int main() {
    int n, k, q;
    cin >> n >> k >> q;

    const int max_temp = 200000;
    vector<int> diff(max_temp + 2, 0);
    for (int i = 0; i < n; ++i) {
        int l, r;
        cin >> l >> r;
        diff[l] += 1;
        diff[r + 1] -= 1;
    }
    vector<int> recommendations(max_temp + 1, 0);
    for (int i = 1; i <= max_temp; ++i) {
        recommendations[i] = recommendations[i - 1] + diff[i];
    }
    vector<int> admissible(max_temp + 1, 0);
    for (int i = 1; i <= max_temp; ++i) {
        if (recommendations[i] >= k) {
            admissible[i] = 1;
        }
    }
    vector<int> prefix_admissible(max_temp + 1, 0);
    for (int i = 1; i <= max_temp; ++i) {
        prefix_admissible[i] = prefix_admissible[i - 1] + admissible[i];
    }
    for (int i = 0; i < q; ++i)
	{
        int a, b;
        cin >> a >> b;
        int result = prefix_admissible[b] - prefix_admissible[a - 1];
        cout << result << endl;
    }

    return 0;
}
