#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

bool compare(const string &a, const string &b) {
    return a + b > b + a;
}

int main() {
    int n;
    cin >> n;
    vector<string> numbers(n);
    for (int i = 0; i < n; ++i) {
        cin >> numbers[i];
    }

    // Sort using the custom compare function
    sort(numbers.begin(), numbers.end(), compare);

    // Concatenate the sorted numbers
    string result;
    for (const string &num : numbers) {
        result += num;
    }

    // Handle the case where the result is "000...0"
    if (result[0] == '0') {
        cout << "0" << endl;
    } else {
        cout << result << endl;
    }

    return 0;
}