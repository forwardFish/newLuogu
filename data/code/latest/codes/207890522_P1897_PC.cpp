#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> floors(n);
    for (int i = 0; i < n; ++i) {
        cin >> floors[i];
    }

    // 将楼层排序
    sort(floors.begin(), floors.end());

    int total_time = 0;
    int current_floor = 0;

    // 模拟电梯上行
    for (int i = 0; i < n; ++i) {
        if (floors[i] > current_floor) {
            total_time += (floors[i] - current_floor) * 6;
            current_floor = floors[i];
        }
        // 开门和下人的时间
        total_time += 5;
        total_time += 1;
    }

    // 模拟电梯下行
    total_time += current_floor * 4;

    cout << total_time << endl;

    return 0;
}