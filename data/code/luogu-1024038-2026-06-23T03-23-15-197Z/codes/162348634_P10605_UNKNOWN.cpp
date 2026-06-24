#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    int n, m;
    cin >> n >> m;

    vector<int> tasks(n);
    vector<int> busy_days(m);

    for (int i = 0; i < n; ++i) {
        cin >> tasks[i];
    }

    for (int i = 0; i < m; ++i) {
        cin >> busy_days[i];
    }

    int current_time = 1;
    int busy_index = 0;
    int total_days = 0;

    for (int i = 0; i < n; ++i) {
        while (busy_index < m && current_time == busy_days[busy_index]) {
            current_time++;
            busy_index++;
        }

        total_days = current_time + tasks[i] - 1;
        current_time = total_days + 1;

        while (busy_index < m && current_time == busy_days[busy_index]) {
            current_time++;
            busy_index++;
        }
    }

    cout << total_days << endl;

    return 0;
}
