#include<bits/stdc++.h>
using namespace std;
int main() {
    int n, m, k;
    cin >> n >> m >> k;
    vector<vector<int>> A(n, vector<int>(m));
    vector<vector<int>> B(m, vector<int>(k));
    vector<vector<int>> C(n, vector<int>(k, 0));
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < m; ++j) {
            cin >> A[i][j];
        }
    }
    for (int i = 0; i < m; ++i) {
        for (int j = 0; j < k; ++j) {
            cin >> B[i][j];
        }
    }
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < k; ++j) {
            for (int l = 0; l < m; ++l) {
                C[i][j] += A[i][l] * B[l][j];
            }
        }
    }
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < k; ++j) {
            cout << C[i][j] << " ";
        }
        cout << endl;
    }

    return 0;
}
