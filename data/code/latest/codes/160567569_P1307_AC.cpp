#include <iostream>
#include <string>
#include <algorithm>

int main() {
    // 读取输入
    int N;
    std::cin >> N;
    
    // 判断是否为负数
    bool isNegative = N < 0;
    
    // 转换为绝对值
    N = std::abs(N);
    
    // 将数字转换为字符串
    std::string str = std::to_string(N);
    
    // 反转字符串
    std::reverse(str.begin(), str.end());
    
    // 转换回整数
    int reversedNum = std::stoi(str);
    
    // 如果是负数，结果也要是负数
    if (isNegative) {
        reversedNum = -reversedNum;
    }
    
    // 输出结果
    std::cout << reversedNum << std::endl;
    
    return 0;
}
