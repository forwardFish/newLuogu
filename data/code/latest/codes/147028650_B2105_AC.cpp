#include<bits/stdc++.h>
using namespace std;
int main() {
    int n, m, k;
    cin >> n >> m >> k;
    vector<vector<int>> a(n, vector<int>(m));
    vector<vector<int>> b(m, vector<int>(k));
    vector<vector<int>> c(n, vector<int>(k, 0));
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < m; ++j) {
            cin >> a[i][j];
        }
    }
    for (int i = 0; i < m; ++i) {
        for (int j = 0; j < k; ++j) {
            cin >> b[i][j];
        }
    }
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < k; ++j) {
            for (int l = 0; l < m; ++l) {
                c[i][j] += a[i][l] * b[l][j];
            }
        }
    }
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < k; ++j) {
            cout << c[i][j] << " ";
        }
        cout << endl;
    }

    return 0;
}
