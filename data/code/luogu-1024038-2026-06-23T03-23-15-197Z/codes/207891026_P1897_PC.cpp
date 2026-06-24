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

    // 对楼层进行排序
    sort(floors.begin(), floors.end());

    // 计算电梯运行时间
    int total_time = 0; 

    // 时间计算
    // 从 0 层开始到达最高层，再回到 0 层
    total_time += floors.back() * 6; // 上升到最高楼层
    total_time += floors.back() * 4; // 回到 0 层

    // 每个人到达楼层
    total_time += n * 5; // 每开门一次需要 5s
    total_time += n;     // 每人下电梯需要 1s

    cout << total_time << endl;
    return 0;
}
