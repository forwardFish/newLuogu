#include <iostream>
using namespace std;
bool L(int num)
{
    return num % 3 != 0 && num % 10 != 3;
}
int main() {
    int t;
    cin >> t;
    while (t--) {
        int k;
        cin >> k;
        int count = 0;
        int num = 0;
        while (count < k) {
            num++;
            if (L(num)) {
                count++;
            }
        }
        cout << num << endl;
    }
    return 0;
}
