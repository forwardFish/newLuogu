#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

struct Candidate {
    int id;
    int score;
};

int main() {
    int n, m;
    cin >> n >> m;
    vector<Candidate> candidates(n);
    for (int i = 0; i < n; ++i) {
        cin >> candidates[i].id >> candidates[i].score;
    }
    
    // 排序：成绩降序，成绩相同则按报名号升序
    sort(candidates.begin(), candidates.end(), [](const Candidate& a, const Candidate& b) {
        if (a.score != b.score) {
            return a.score > b.score;
        } else {
            return a.id < b.id;
        }
    });
    
    int k = (m * 3) / 2;
    int line_score = candidates[k - 1].score;
    
    // 统计进入面试的人数
    int count = 0;
    for (const auto& c : candidates) {
        if (c.score >= line_score) {
            count++;
        } else {
            break;
        }
    }
    
    // 输出结果
    cout << line_score << " " << count << endl;
    for (int i = 0; i < count; ++i) {
        cout << candidates[i].id << " " << candidates[i].score << endl;
    }
    
    return 0;
}