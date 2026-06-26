#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

struct Student {
    int id;
    int chinese;
    int total;
};

bool compare(const Student &a, const Student &b) {
    if (a.total != b.total) {
        return a.total > b.total;
    }
    if (a.chinese != b.chinese) {
        return a.chinese > b.chinese;
    }
    return a.id < b.id;
}

int main() {
    int n;
    cin >> n;
    vector<Student> students;

    for (int i = 0; i < n; ++i) {
        int ch, math, en;
        cin >> ch >> math >> en;
        Student s;
        s.id = i + 1;
        s.chinese = ch;
        s.total = ch + math + en;
        students.push_back(s);
    }

    sort(students.begin(), students.end(), compare);

    int count = min(5, (int)students.size());
    for (int i = 0; i < count; ++i) {
        cout << students[i].id << " " << students[i].total << endl;
    }

    return 0;
}