#include <iostream>
#include <vector>
#include <string>
#include <sstream>

int main() {
    // 读取输入行
    std::vector<std::string> lines;
    std::string line;
    while (std::cin >> line) {
        lines.push_back(line);
    }
    
    // 获取矩阵大小 N
    int N = lines.size();
    
    // 初始化结果数组，首先插入N
    std::vector<int> result;
    result.push_back(N);
    
    // 按顺序遍历矩阵
    int count = 0;
    char currentChar = lines[0][0];
    
    for (int i = 0; i < N; ++i) {
        for (int j = 0; j < N; ++j) {
            if (lines[i][j] == currentChar) {
                count++;
            } else {
                result.push_back(count);
                count = 1;
                currentChar = lines[i][j];
            }
        }
    }
    // 最后一个连续数
    result.push_back(count);
    
    // 输出结果
    for (int i = 0; i < result.size(); ++i) {
        if (i > 0) std::cout << " ";
        std::cout << result[i];
    }
    std::cout << std::endl;
    
    return 0;
}
