#include <iostream>
#include <vector>
#include <string>

int main() {
    // 读取输入
    std::vector<int> compressCode;
    int num;
    while (std::cin >> num) {
        compressCode.push_back(num);
    }
    
    // 获取矩阵大小 N
    int N = compressCode[0];
    
    // 初始化 N x N 矩阵
    std::vector<std::vector<char>> matrix(N, std::vector<char>(N, '0'));
    
    // 解压缩填充矩阵
    int k = 1; // 指向 compressCode 的位置
    int i = 0, j = 0; // 当前矩阵的行和列位置
    bool fillOne = false; // 当前是否填充 1

    while (k < compressCode.size()) {
        int count = compressCode[k++];
        
        for (int c = 0; c < count; ++c) {
            matrix[i][j] = fillOne ? '1' : '0';
            j++;
            if (j == N) {
                j = 0;
                i++;
            }
        }
        fillOne = !fillOne; // 交替填充 0 和 1
    }
    
    // 输出矩阵
    for (int i = 0; i < N; ++i) {
        for (int j = 0; j < N; ++j) {
            std::cout << matrix[i][j];
        }
        std::cout << std::endl;
    }
    
    return 0;
}
