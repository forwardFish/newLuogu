#include <iostream>
#include <unordered_set>
#include <queue>
#include <string>

using namespace std;

int main() {
    string n;
    int k;
    cin >> n >> k;

    unordered_set<string> generatedNumbers;
    queue<string> toProcess;

    generatedNumbers.insert(n);
    toProcess.push(n);

    // Read transformation rules
    char from[10], to[10];
    for (int i = 0; i < 10; i++) {
        from[i] = i + '0';
        to[i] = i + '0';
    }
    for (int i = 0; i < k; i++) {
        char x, y;
        cin >> x >> y;
        from[x - '0'] = x;
        to[x - '0'] = y;
    }

    // BFS to generate all possible numbers
    while (!toProcess.empty()) {
        string current = toProcess.front();
        toProcess.pop();

        for (int i = 0; i < current.length(); i++) {
            if (to[current[i] - '0'] != '0') {
                string newNumber = current;
                newNumber[i] = to[current[i] - '0'];

                if (generatedNumbers.find(newNumber) == generatedNumbers.end()) {
                    generatedNumbers.insert(newNumber);
                    toProcess.push(newNumber);
                }
            }
        }
    }

    // Output the number of unique generated numbers
    cout << generatedNumbers.size() << endl;

    return 0;
}
