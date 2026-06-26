#include <cstdio>
#include <iostream>
#include <algorithm>
#include <string>
using namespace std;
const int MAXN = 10;

bool visit[MAXN];//判断某个元素是否被访问过
char sequence[MAXN];//存放找到的全排列

void GetPermutation(string str, int index){
    // 找到结果并打印
    if (index == str.size()) {
        // 打印结果
        for (int i = 0; i < str.size(); ++i) {
            putchar(sequence[i]);
        }
        printf("\n");
    }
    for (int i = 0; i < str.size(); ++i) {
        if (visit[i]) {//被访问过就跳过
            continue;
        } else {
            visit[i] = true;
            sequence[index] = str[i];
            //接着查找下一位
            GetPermutation(str, index + 1);
            visit[i] = false;
        }
    }
}
int main(){
    string str;
    while (cin >> str) {
        sort(str.begin(), str.end());// 输入的字符串排序，保证以字典序输出
        GetPermutation(str, 0);
        printf("\n");
    }
    return 0;
}