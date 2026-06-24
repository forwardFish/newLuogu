#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

vector<int> calculate_award_scores(int n, int w, const vector<int>& scores) {
    vector<int> awarded_scores;
    vector<int> results;

    for (int i = 0; i < n; ++i) {
        // Add the current score to the awarded scores list
        awarded_scores.push_back(scores[i]);
        // Sort the scores in descending order
        sort(awarded_scores.begin(), awarded_scores.end(), greater<int>());
        // Calculate the number of winners
        int num_winners = max(1, static_cast<int>((awarded_scores.size() * w) / 100));
        // The score to beat to be in the top 'num_winners' is at index 'num_winners - 1'
        int threshold_score = awarded_scores[num_winners - 1];
        // Append the current threshold score to results
        results.push_back(threshold_score);
    }

    return results;
}

int main() {
    int n, w;
    cin >> n >> w;
    vector<int> scores(n);
    for (int i = 0; i < n; ++i) {
        cin >> scores[i];
    }

    vector<int> results = calculate_award_scores(n, w, scores);

    for (size_t i = 0; i < results.size(); ++i) {
        if (i > 0) cout << " ";
        cout << results[i];
    }
    cout << endl;

    return 0;
}
