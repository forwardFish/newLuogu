#include <iostream>
#include <string>
#include <unordered_set>
using namespace std;

// 预计算所有可能的2的幂形式
unordered_set<string> generatePowersOfTwo() {
    unordered_set<string> powersOfTwo;
    for (int i = 1; i < (1 << 30); i *= 2) {
        powersOfTwo.insert(to_string(i));
    }
    return powersOfTwo;
}

// 检查并修改数字串，使其不包含2的幂形式的子串
int minModifications(string s) {
    unordered_set<string> powersOfTwo = generatePowersOfTwo();
    int n = s.length();
    int count = 0;
    
    for (int len = 1; len <= n; ++len) { // 子串长度
        for (int i = 0; i <= n - len; ++i) { // 子串起始位置
            string sub = s.substr(i, len);
            if (powersOfTwo.find(sub) != powersOfTwo.end()) {
                // 找到一个2的幂的子串，进行修改
                s[i] = (s[i] == '1') ? '9' : '1'; // 简单修改，避免2的幂
                ++count;
                // 从修改位置之后重新开始
                i = i - len; // 重置i以从修改后的位置重新检测
                if (i < -1) i = -1; // 防止越界
            }
        }
    }
    return count;
}

int main() {
    string s;
    cin >> s;
    cout << minModifications(s) << endl;
    return 0;
}
