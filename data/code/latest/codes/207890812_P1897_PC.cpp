#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;  // 乘坐电梯的人数
    cin >> n;
    
    vector<int> floors(n);  // 每个人要抵达的楼层
    for (int i = 0; i < n; i++) {
        cin >> floors[i];
    }
    
    // 电梯需要的总时间
    int total_time = 0;
    
    // 找到最高楼层
    int max_floor = *max_element(floors.begin(), floors.end());
    
    // 上升到最高楼层时间
    total_time += max_floor * 6;

    // 降回 0 层时间
    total_time += max_floor * 4;

    // 开门时间（每个乘客到达一个楼层才开一次门）
    total_time += 5 * n;

    // 每个乘客下电梯的时间
    total_time += n;

    cout << total_time << endl;  // 输出总时间
    return 0;
}
