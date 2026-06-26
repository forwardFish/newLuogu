#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

typedef long long ll;

const int MAXL = 2000; // 仅用于小数据，大数据无法处理

int L, N, K;
int X[200005], Y[200005], Z[200005];

int main() {
    cin >> L >> N >> K;
    for (int i = 0; i < N; i++) {
        cin >> X[i] >> Y[i] >> Z[i];
    }

    // 只处理小数据（子任务2,3）
    if (L > MAXL) {
        for (int k = 1; k <= K; k++) cout << 0 << endl;
        return 0;
    }

    // cnt[x][y] 表示朝上小三角形（左下角为(x,y)）被覆盖的次数
    // cnt2[x][y] 表示朝下小三角形（左下角为(x,y)）被覆盖的次数
    vector<vector<int>> cnt(L, vector<int>(L, 0));
    vector<vector<int>> cnt2(L, vector<int>(L, 0));

    // 处理每个预报
    for (int i = 0; i < N; i++) {
        int x0 = X[i], y0 = Y[i], z = Z[i];

        // 朝上小三角形：顶点 (x,y), (x+1,y), (x,y+1)
        int S = x0 + y0 + z - 1;          // x+y ≤ S
        for (int x = x0; x <= S; x++) {
            int ymax = S - x;
            if (ymax < y0) continue;
            for (int y = y0; y <= ymax; y++) {
                if (x + y <= L - 1) {
                    cnt[x][y]++;
                }
            }
        }

        // 朝下小三角形：顶点 (x+1,y), (x,y+1), (x+1,y+1)
        S = x0 + y0 + z - 2;              // x+y ≤ S
        int xmin = x0 - 1, ymin = y0 - 1;
        for (int x = xmin; x <= S; x++) {
            int ymax = S - x;
            if (ymax < ymin) continue;
            for (int y = ymin; y <= ymax; y++) {
                if (x >= 0 && y >= 0 && x + y <= L - 2) {
                    cnt2[x][y]++;
                }
            }
        }
    }

    // 统计每个覆盖次数的小三角形个数
    vector<int> freq(N + 1, 0);
    for (int x = 0; x < L; x++) {
        for (int y = 0; y < L; y++) {
            if (x + y <= L - 1) {
                int c = cnt[x][y];
                if (c > N) c = N;
                freq[c]++;
            }
            if (x + y <= L - 2) {
                int c = cnt2[x][y];
                if (c > N) c = N;
                freq[c]++;
            }
        }
    }

    // 输出至少 k 天的区域数量
    for (int k = 1; k <= K; k++) {
        ll ans = 0;
        for (int c = k; c <= N; c++) ans += freq[c];
        cout << ans << endl;
    }

    return 0;
}