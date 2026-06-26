#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    int N, M, X, Y;
    cin >> N >> M >> X >> Y;
    
    vector<int> red_mask(N);
    for (int i = 0; i < N; ++i) {
        string s;
        cin >> s;
        int mask = 0;
        for (int j = 0; j < M; ++j) {
            if (s[j] == '1')
                mask |= 1 << j;
        }
        red_mask[i] = mask;
    }
    
    int max_str = 0;
    for (int B = 0; B < (1 << M); ++B) {
        int blue_cnt = __builtin_popcount(B);
        int sum_red = 0;
        for (int i = 0; i < N; ++i) {
            int cnt = __builtin_popcount(red_mask[i] & B);
            sum_red += max(0, cnt - X);
        }
        int str = sum_red - Y * blue_cnt;
        if (str > max_str)
            max_str = str;
    }
    
    cout << max_str << '\n';
    return 0;
}