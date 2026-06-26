#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m; // 读取书的数量n和时间限制m
    vector<int> a(n);
    for (int i = 0; i < n; ++i) {
        cin >> a[i]; // 读取每本书所需的时间
    }

    int l = 0, r = 0; // 定义两个指针l和r，分别表示当前考虑的子数组的起始和结束位置
    int sum = 0; // 当前子数组中所有书所需时间的总和
    int maxBooks = 0; // 最多能读的书的数量

    while (r < n) { // 当右指针r没有超出数组范围时
        if (sum + a[r] <= m) { // 如果加上当前书的时间不超过时间限制m
            sum += a[r]; // 更新总时间
            r++; // 右指针右移，考虑下一本书
            maxBooks = max(maxBooks, r - l); // 更新最多能读的书的数量
        } else { // 如果加上当前书的时间超过时间限制m
            if (l < r) { // 如果左指针l在右指针r的左边
                sum -= a[l]; // 从总时间中减去左指针所指的书的时间
                l++; // 左指针右移，排除当前书，考虑下一本书
            } else { // 如果左指针l和右指针r重合
                l++; // 左右指针同时右移，跳过当前书
                r++;
            }
        }
    }

    cout << maxBooks << endl; // 输出最多能读的书的数量
    return 0;
}
