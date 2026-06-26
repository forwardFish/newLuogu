#include <iostream>
#include <cstring>
using namespace std;

int main() {
    string encrypted, original, target;
    cin >> encrypted >> original >> target;

    int orig_to_encrypt[26];
    int encrypt_to_orig[26];
    memset(orig_to_encrypt, -1, sizeof(orig_to_encrypt));
    memset(encrypt_to_orig, -1, sizeof(encrypt_to_orig));

    bool conflict = false;
    for (int i = 0; i < original.size(); ++i) {
        char x = original[i];
        char y = encrypted[i];
        int x_idx = x - 'A';
        int y_idx = y - 'A';

        if (orig_to_encrypt[x_idx] != -1 && orig_to_encrypt[x_idx] != y_idx) {
            conflict = true;
            break;
        }
        if (encrypt_to_orig[y_idx] != -1 && encrypt_to_orig[y_idx] != x_idx) {
            conflict = true;
            break;
        }
        orig_to_encrypt[x_idx] = y_idx;
        encrypt_to_orig[y_idx] = x_idx;
    }

    if (conflict) {
        cout << "Failed" << endl;
        return 0;
    }

    for (int i = 0; i < 26; ++i) {
        if (orig_to_encrypt[i] == -1) {
            cout << "Failed" << endl;
            return 0;
        }
    }

    string result;
    for (char c : target) {
        int y_idx = c - 'A';
        if (encrypt_to_orig[y_idx] == -1) {
            cout << "Failed" << endl;
            return 0;
        }
        result += (char)('A' + encrypt_to_orig[y_idx]);
    }

    cout << result << endl;

    return 0;
}