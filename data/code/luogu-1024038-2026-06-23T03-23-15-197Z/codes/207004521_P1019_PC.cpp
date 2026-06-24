#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

vector<string> words;
vector<vector<int>> overlap;
vector<int> used;
int n, max_len = 0;

void dfs(int last, int current_len) {
    max_len = max(max_len, current_len);
    for (int j = 0; j < n; ++j) {
        if (used[j] < 2 && overlap[last][j] > 0) {
            int add_len = words[j].size() - overlap[last][j];
            used[j]++;
            dfs(j, current_len + add_len);
            used[j]--;
        }
    }
}

int main() {
    cin >> n;
    words.resize(n);
    for (int i = 0; i < n; ++i) {
        cin >> words[i];
    }
    char start_char;
    cin >> start_char;

    // 预处理重叠部分，确保k < len(a)且k < len(b)
    overlap.resize(n, vector<int>(n, 0));
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < n; ++j) {
            string &a = words[i], &b = words[j];
            int len_a = a.size(), len_b = b.size();
            int max_possible = min(len_a, len_b) - 1; // 确保k严格小于两单词长度
            for (int k = max_possible; k > 0; --k) {
                if (a.substr(len_a - k, k) == b.substr(0, k)) {
                    overlap[i][j] = k;
                    break;
                }
            }
        }
    }

    used.resize(n, 0);
    for (int i = 0; i < n; ++i) {
        if (words[i][0] == start_char) {
            used[i]++;
            dfs(i, (int)words[i].size());
            used[i]--;
        }
    }

    cout << max_len << endl;

    return 0;
}