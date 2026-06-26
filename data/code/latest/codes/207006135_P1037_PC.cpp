#include <iostream>
#include <unordered_set>
#include <queue>
#include <string>
#include <unordered_map> // 包含 unordered_map 的头文件

using namespace std;

int main() {
    string n;
    int k;
    cin >> n >> k;

    unordered_set<string> generatedNumbers;
    queue<string> toProcess;

    generatedNumbers.insert(n);
    toProcess.push(n);

    unordered_map<char, char> rules;

    for (int i = 0; i < k; i++) {
        char x, y;
        cin >> x >> y;
        if (y != '0') {
            rules[x] = y;
        }
    }

    while (!toProcess.empty()) {
        string current = toProcess.front();
        toProcess.pop();

        for (int i = 0; i < current.length(); i++) {
            if (rules.find(current[i]) != rules.end()) {
                string newNumber = current;
                newNumber[i] = rules[current[i]];

                if (generatedNumbers.find(newNumber) == generatedNumbers.end()) {
                    generatedNumbers.insert(newNumber);
                    toProcess.push(newNumber);
                }
            }
        }
    }

    cout << generatedNumbers.size() << endl;

    return 0;
}
