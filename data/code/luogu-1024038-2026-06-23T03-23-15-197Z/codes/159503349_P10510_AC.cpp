#include<bits/stdc++.h>
using namespace std;
vector<int> decimalToTernary(long long V)
{
    vector<int> ternary;
    if (V == 0) {
        ternary.push_back(0);
    } else {
        while (V > 0) {
            ternary.push_back(V % 3);
            V /= 3;
        }
    }
    return ternary;
}
long long ternaryToDecimal(const vector<int>& ternary) {
    long long value = 0;
    long long power = 1;
    for (int digit : ternary) {
        value += digit * power;
        power *= 3;
    }
    return value;
}
int main() {
    long long V;
    int q;
    cin >> V >> q;
    vector<int> ternary = decimalToTernary(V);
    for (int i = 0; i < q; ++i) {
        int op, idx;
        cin >> op >> idx;
        while (idx >= ternary.size()) {
            ternary.push_back(0);
        }
        if (op == 1) {
            ternary[idx] = (ternary[idx] + 1) % 3;
        } else if (op == 2) {
            ternary[idx] = (ternary[idx] + 2) % 3;
        } else if (op == 3) {
            if (ternary[idx] == 1) {
                ternary[idx] = 2;
            } else if (ternary[idx] == 2) {
                ternary[idx] = 1;
            }
        }
        cout << ternaryToDecimal(ternary) << endl;
    }
    return 0;
}
