#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

string multiply(string num1, string num2) {
    if (num1 == "0" || num2 == "0") return "0";
    int n1 = num1.size(), n2 = num2.size();
    vector<int> res(n1 + n2, 0);
    reverse(num1.begin(), num1.end());
    reverse(num2.begin(), num2.end());
    for (int i = 0; i < n1; ++i) {
        int d1 = num1[i] - '0';
        for (int j = 0; j < n2; ++j) {
            int d2 = num2[j] - '0';
            res[i + j] += d1 * d2;
            res[i + j + 1] += res[i + j] / 10;
            res[i + j] %= 10;
        }
    }
    int pos = res.size() - 1;
    while (pos > 0 && res[pos] == 0)
        pos--;
    string ans;
    for (; pos >= 0; --pos)
        ans += (res[pos] + '0');
    return ans;
}

bool compare(const string &a, const string &b) {
    if (a.size() != b.size())
        return a.size() > b.size();
    for (int i = 0; i < a.size(); ++i) {
        if (a[i] != b[i])
            return a[i] > b[i];
    }
    return false;
}

int main() {
    int N, K;
    string s;
    cin >> N >> K >> s;
    vector<vector<string>> num(N + 1, vector<string>(N + 1));
    for (int i = 1; i <= N; ++i) {
        string tmp;
        for (int j = i; j <= N; ++j) {
            tmp += s[j - 1];
            num[i][j] = tmp;
        }
    }
    vector<vector<string>> dp(N + 1, vector<string>(K + 1));
    for (int i = 1; i <= N; ++i)
        dp[i][0] = num[1][i];
    for (int j = 1; j <= K; ++j) {
        for (int i = j + 1; i <= N; ++i) {
            string max_val = "0";
            for (int k = j; k < i; ++k) {
                string product = multiply(dp[k][j - 1], num[k + 1][i]);
                if (compare(product, max_val))
                    max_val = product;
            }
            dp[i][j] = max_val;
        }
    }
    cout << dp[N][K] << endl;
    return 0;
}