#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    int N;
    cin >> N;
    vector<int> p(N);
    for (int i = 0; i < N; ++i) {
        cin >> p[i];
    }

    // 构建所有单词
    vector<string> words(N + 1);
    words[0] = "";
    for (int i = 1; i <= N; ++i) {
        words[i] = words[p[i - 1]] + char('a' + i - 1); // 假设字符是'a'到'z'
    }

    // 确定词库中的单词
    vector<bool> isPrefix(N + 1, false);
    for (int i = 0; i <= N; ++i) {
        for (int j = 0; j <= N; ++j) {
            if (i != j && words[j].find(words[i]) == 0) {
                isPrefix[i] = true;
                break;
            }
        }
    }

    vector<int> vocabulary;
    for (int i = 0; i <= N; ++i) {
        if (!isPrefix[i]) {
            vocabulary.push_back(i);
        }
    }

    int M;
    cin >> M;
    vector<int> w(M);
    for (int i = 0; i < M; ++i) {
        cin >> w[i];
    }

    // 计算每个单词的字符数
    for (int i = 0; i < M; ++i) {
        int currentWord = w[i];
        string current = words[currentWord];
        int maxCommonPrefix = 0;
        for (int j = 0; j < M; ++j) {
            if (j == i) continue;
            string other = words[w[j]];
            int common = 0;
            while (common < current.size() && common < other.size() && current[common] == other[common]) {
                common++;
            }
            if (common > maxCommonPrefix) {
                maxCommonPrefix = common;
            }
        }
        cout << maxCommonPrefix + 1 << endl;
    }

    return 0;
}