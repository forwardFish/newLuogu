#include <iostream>

using namespace std;

int main() {
    int n, k;
    cin >> n >> k;
    int total_time = 4 * 60;
    int remaining_time = total_time - k;
    int solved_problems = 0;
    int time_spent = 0;
    for (int i = 1; i <= n; ++i) {
        time_spent += 5 * i;
        if (time_spent <= remaining_time) {
            solved_problems++;
        } else {
            break;
        }
    }

    cout << solved_problems << endl;
    return 0;
}
