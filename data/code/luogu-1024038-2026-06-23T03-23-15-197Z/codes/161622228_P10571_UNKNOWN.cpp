#include <iostream>
#include <string>
#include <vector>
#include <cmath>

using namespace std;

// 检查一个数字是否是2的幂次方
bool isPowerOfTwo(int n) {
    return (n != 0) && ((n & (n - 1)) == 0);
}

// 函数来计算最少的操作次数
int minOperations(string s) {
    int n = s.length();
    int count = 0;
    vector<int> lastSeen(10, -1); // 记录每个数字最后出现的位置

    for (int i = 0; i < n; ++i) {
        int num = s[i] - '0'; // 将字符转换为整数
        // 检查当前数字是否是2的幂次方的一部分
        if (isPowerOfTwo(num)) {
            // 检查该数字是否在之前出现过
            if (lastSeen[num] != -1) {
                // 如果出现过，检查是否需要修改
                if (lastSeen[num] < i - 1) {
                    // 如果当前数字和上一个相同数字之间没有其他数字出现
                    // 则不需要修改，只需要将这个数字的位置记录下来
                    lastSeen[num] = i;
                } else {
                    // 如果需要修改，找到当前子串中未出现的最小数字
                    int minNotSeen = 1;
                    for (int j = 1; j <= 9; ++j) {
                        if (lastSeen[j] == -1 || lastSeen[j] < i - 1) {
                            minNotSeen = j;
                            break;
                        }
                    }
                    // 将当前数字修改为找到的最小数字
                    s[i] = '0' + minNotSeen;
                    count++;
                    lastSeen[minNotSeen] = i;
                }
            } else {
                // 如果是第一次出现，记录这个数字的位置
                lastSeen[num] = i;
            }
        }
    }
    return count;
}

int main() {
    string s;
    cin >> s;
    cout << minOperations(s) << endl;
    return 0;
}