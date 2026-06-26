#include <iostream>
#include <unordered_map>
#include <vector>
#include <algorithm>

int main() {
    std::string s;
    std::getline(std::cin, s);  // Read the entire input line

    std::unordered_map<char, int> charCount;
    
    // Count each character's frequency, excluding spaces
    for (char c : s) {
        if (c != ' ') {
            charCount[c]++;
        }
    }

    // Convert the map to a vector of pairs for sorting
    std::vector<std::pair<char, int>> charFrequency(charCount.begin(), charCount.end());

    // Sort by frequency descending, then by ASCII value ascending
    std::sort(charFrequency.begin(), charFrequency.end(), [](const std::pair<char, int>& a, const std::pair<char, int>& b) {
        if (a.second == b.second) {
            return a.first < b.first;
        }
        return a.second > b.second;
    });

    // Output the characters in the required order
    for (const auto& pair : charFrequency) {
        std::cout << pair.first;
    }

    std::cout << std::endl;
    return 0;
}
