#include <iostream>
#include <vector>
#include <cstring>

using namespace std;

// MOD constant for modulo arithmetic
const int MOD = 11192869;

// Directions for moving in 4 possible ways (up, down, left, right)
const int dx[4] = {0, 0, -1, 1};
const int dy[4] = {-1, 1, 0, 0};

// Helper function to check if a position is within the bounds of the matrix
bool isValid(int x, int y, int n, int m) {
    return x >= 0 && x < n && y >= 0 && y < m;
}

// Recursive DFS function to count the valid paths
int dfs(int x, int y, int index, const vector<vector<int>>& T, const vector<int>& L, vector<vector<int>>& visited, vector<vector<vector<int>>>& memo) {
    int n = T.size();
    int m = T[0].size();
    int totalCells = n * m;

    // If we have completed the sequence, return 1
    if (index == totalCells) {
        return 1;
    }

    // Use memoization to avoid recalculating previously computed results
    if (memo[x][y][index] != -1) {
        return memo[x][y][index];
    }

    int count = 0;

    // Try all possible moves (up, down, left, right)
    for (int i = 0; i < 4; i++) {
        int nx = x + dx[i];
        int ny = y + dy[i];

        if (isValid(nx, ny, n, m) && !visited[nx][ny] && T[nx][ny] == L[index]) {
            visited[nx][ny] = 1;
            count = (count + dfs(nx, ny, index + 1, T, L, visited, memo)) % MOD;
            visited[nx][ny] = 0;
        }
    }

    // Store the result in the memoization table
    memo[x][y][index] = count;

    return count;
}

// Main function to count all valid travel routes
int countValidRoutes(int n, int m, const vector<vector<int>>& T, const vector<int>& L) {
    int totalCells = n * m;

    // Initialize visited array and memoization table
    vector<vector<int>> visited(n, vector<int>(m, 0));
    vector<vector<vector<int>>> memo(n, vector<vector<int>>(m, vector<int>(totalCells, -1)));

    int totalRoutes = 0;

    // Find all possible starting points (on the boundary of the matrix)
    vector<pair<int, int>> startingPoints;

    // Top and bottom row boundary
    for (int j = 0; j < m; j++) {
        if (T[0][j] == L[0]) startingPoints.push_back({0, j});
        if (n > 1 && T[n - 1][j] == L[0]) startingPoints.push_back({n - 1, j});
    }

    // Left and right column boundary (without duplicating corners)
    for (int i = 1; i < n - 1; i++) {
        if (T[i][0] == L[0]) startingPoints.push_back({i, 0});
        if (m > 1 && T[i][m - 1] == L[0]) startingPoints.push_back({i, m - 1});
    }

    // Calculate the total valid routes from each starting point
    for (auto& point : startingPoints) {
        int x = point.first;
        int y = point.second;
        visited[x][y] = 1;
        totalRoutes = (totalRoutes + dfs(x, y, 1, T, L, visited, memo)) % MOD;
        visited[x][y] = 0;
    }

    return totalRoutes;
}

int main() {
    int n, m;
    cin >> n >> m;

    vector<vector<int>> T(n, vector<int>(m));
    vector<int> L(n * m);

    // Input T matrix
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            cin >> T[i][j];
        }
    }

    // Input L sequence
    for (int i = 0; i < n * m; i++) {
        cin >> L[i];
    }

    // Calculate and output the total valid routes
    int result = countValidRoutes(n, m, T, L);
    cout << result << endl;

    return 0;
}
