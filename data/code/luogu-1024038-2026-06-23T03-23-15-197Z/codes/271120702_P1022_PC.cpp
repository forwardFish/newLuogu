#include <iostream>
#include <string>
#include <cstdio>
using namespace std;

int main() {
    string s;
    cin >> s;
    
    char unknown;  // 未知数
    // 找到未知数是什么字母
    for (char c : s) {
        if (c >= 'a' && c <= 'z') {
            unknown = c;
            break;
        }
    }
    
    // 在方程末尾添加一个 '+' 以便处理最后一个数字
    s += '+';
    
    int leftCoeff = 0;  // 左边未知数系数
    int leftConst = 0;   // 左边常数
    int rightCoeff = 0;  // 右边未知数系数
    int rightConst = 0;  // 右边常数
    
    int num = 0;         // 当前数字
    int sign = 1;        // 当前符号，1为正，-1为负
    bool isLeft = true;  // 是否在左边
    bool hasNum = false; // 是否遇到过数字
    
    for (int i = 0; i < s.length(); i++) {
        char c = s[i];
        
        if (c >= '0' && c <= '9') {
            // 处理数字
            num = num * 10 + (c - '0');
            hasNum = true;
        } 
        else if (c == unknown) {
            // 处理未知数
            if (!hasNum) {
                // 如果未知数前面没有数字，系数为1
                num = 1;
            }
            
            if (isLeft) {
                leftCoeff += sign * num;
            } else {
                rightCoeff += sign * num;
            }
            
            // 重置
            num = 0;
            hasNum = false;
        }
        else {
            // 处理运算符或等号
            if (hasNum) {
                // 有数字，这是常数项
                if (isLeft) {
                    leftConst += sign * num;
                } else {
                    rightConst += sign * num;
                }
                num = 0;
                hasNum = false;
            }
            
            if (c == '=') {
                isLeft = false;  // 切换到右边
                sign = 1;        // 右边默认符号为正
            } 
            else if (c == '+') {
                sign = 1;
            } 
            else if (c == '-') {
                sign = -1;
            }
        }
    }
    
    // 移项：将所有未知数移到左边，常数移到右边
    // 左边系数 = leftCoeff - rightCoeff
    // 右边常数 = rightConst - leftConst
    int coeff = leftCoeff - rightCoeff;
    int constant = rightConst - leftConst;
    
    // 求解
    double result;
    if (coeff != 0) {
        result = (double)constant / coeff;
    }
    
    // 输出结果，保留三位小数
    printf("%c=%.3lf\n", unknown, result);
    
    return 0;
}