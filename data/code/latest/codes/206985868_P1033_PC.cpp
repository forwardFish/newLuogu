#include <iostream>
#include <cmath> // 引入cmath以使用fabs函数

using namespace std;

int main() {
    double H, S1, V, L, K;
    int n;
    cin >> H >> S1 >> V >> L >> K >> n;

    double g = 10.0; // 重力加速度
    int count = 0; // 可以接受的小球数量

    for (int i = 0; i < n; i++) {
        // 计算小球下落时间t
        double t = sqrt((2 * H) / g);

        // 计算小球落地时小车的位置
        double car_position_start = S1 + V * (i);  // 小球下落开始时小车的位置
        double car_position_end = car_position_start + L; // 小车尾部的位置

        // 计算小球下落到地面的高度
        double drop_distance = 0.5 * g * t * t;

        // 小球落地后的位置
        double ball_position = i; // 小球最开始的位置是i

        // 判断小球是否被接受
        if (drop_distance <= H && ball_position >= car_position_start && ball_position <= car_position_end + 0.0001) {
            count++;
        }
    }

    cout << count << endl;

    return 0;
}
