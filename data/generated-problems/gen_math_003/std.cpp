#include <iostream>
#include <vector>
#include <cassert>
using namespace std;

const int MOD = 1000000007;
int C[11][11];

void precompute_C() {
    for (int i = 0; i <= 10; ++i) {
        C[i][0] = C[i][i] = 1;
        for (int j = 1; j < i; ++j)
            C[i][j] = (C[i-1][j-1] + C[i-1][j]) % MOD;
    }
}

using Matrix = vector<vector<long long>>;

Matrix mat_mul(const Matrix& A, const Matrix& B) {
    int d = A.size();
    Matrix C(d, vector<long long>(d, 0));
    for (int i = 0; i < d; ++i)
        for (int k = 0; k < d; ++k) {
            long long aik = A[i][k];
            if (aik != 0)
                for (int j = 0; j < d; ++j)
                    C[i][j] = (C[i][j] + aik * B[k][j]) % MOD;
        }
    return C;
}

Matrix mat_pow(Matrix M, long long p) {
    int d = M.size();
    Matrix res(d, vector<long long>(d, 0));
    for (int i = 0; i < d; ++i) res[i][i] = 1;
    while (p) {
        if (p & 1) res = mat_mul(res, M);
        M = mat_mul(M, M);
        p >>= 1;
    }
    return res;
}

long long mod_pow(long long a, long long b) {
    long long res = 1;
    while (b) {
        if (b & 1) res = res * a % MOD;
        a = a * a % MOD;
        b >>= 1;
    }
    return res;
}

int main() {
    precompute_C();
    long long n, c, k;
    cin >> n >> c >> k;
    if (n == 1) { cout << 1 % MOD << endl; return 0; }
    if (n == 2) { cout << 2 % MOD << endl; return 0; }
    int K = k;
    int d = K + 3;
    Matrix M(d, vector<long long>(d, 0));
    // first row for a_{i+1}
    M[0][0] = 1;
    M[0][1] = c % MOD;
    for (int j = 0; j <= K; ++j) {
        M[0][2+j] = C[K][j];
    }
    // second row for a_i
    M[1][0] = 1;
    // rows for i^d_pow
    for (int d_pow = 0; d_pow <= K; ++d_pow) {
        int row = 2 + d_pow;
        for (int j = 0; j <= d_pow; ++j) {
            M[row][2+j] = C[d_pow][j];
        }
    }
    // initial vector v2
    vector<long long> v2(d, 0);
    v2[0] = 2;
    v2[1] = 1;
    for (int j = 0; j <= K; ++j) {
        v2[2+j] = mod_pow(2, j);
    }
    Matrix P = mat_pow(M, n-2);
    vector<long long> vn(d, 0);
    for (int i = 0; i < d; ++i) {
        for (int j = 0; j < d; ++j) {
            vn[i] = (vn[i] + P[i][j] * v2[j]) % MOD;
        }
    }
    cout << vn[0] << endl;
    return 0;
}