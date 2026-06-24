#include <iostream>
#include <iomanip>
#include <cmath>

using namespace std;

int main() {
    double H, S1, V, L, K;
    int n;
    
    // 输入数据
    cin >> H >> S1 >> V >> L >> K >> n;

    // 小车前端和后端的位置
    double car_front = S1 + L;
    double car_back = S1;

    // g 重力加速度
    const double g = 10.0;

    // 控制能接受的小球数量
    int count = 0;

    for (int i = 0; i < n; i++) {
        // 计算小球下落到地面的时间
        double t = sqrt((2 * H) / g);
        // 计算小车在这个时间内移动的距离
        double car_position_at_time_t = V * t + S1;

        // 小球下落位置
        double ball_position = i;

        // 计算小球与小车的距离
        if (car_back <= ball_position && ball_position <= car_front) {
            count++;
        }
    }

    // 输出结果
    cout << count << endl;

    return 0;
}
