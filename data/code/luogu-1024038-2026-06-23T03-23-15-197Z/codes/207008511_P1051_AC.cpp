#include <iostream>
#include <string>
using namespace std;

int main() {
    int n;
    cin >> n;
    int total_sum = 0;
    int max_total = -1;
    string max_name;

    for (int i = 0; i < n; ++i) {
        string name;
        int end_score, class_score, papers;
        char is_leader, is_west;
        cin >> name >> end_score >> class_score >> is_leader >> is_west >> papers;

        int current_sum = 0;

        // 院士奖学金
        if (end_score > 80 && papers >= 1) {
            current_sum += 8000;
        }
        // 五四奖学金
        if (end_score > 85 && class_score > 80) {
            current_sum += 4000;
        }
        // 成绩优秀奖
        if (end_score > 90) {
            current_sum += 2000;
        }
        // 西部奖学金
        if (end_score > 85 && is_west == 'Y') {
            current_sum += 1000;
        }
        // 班级贡献奖
        if (class_score > 80 && is_leader == 'Y') {
            current_sum += 850;
        }

        total_sum += current_sum;

        if (current_sum > max_total) {
            max_total = current_sum;
            max_name = name;
        }
    }

    cout << max_name << endl;
    cout << max_total << endl;
    cout << total_sum << endl;

    return 0;
}