#include <iostream>
#include <vector>
#include <queue>
#include <cmath>
#include <iomanip>

using namespace std;

struct Point {
    double x, y;
    Point(double x = 0, double y = 0) : x(x), y(y) {}
};

struct Node {
    Point pos;
    double g, h;
    Node(Point pos, double g = 0, double h = 0) : pos(pos), g(g), h(h) {}
    bool operator>(const Node& other) const {
        return (g + h) > (other.g + other.h);
    }
};

struct Obstacle {
    Point pos;
    double size;
    Obstacle(Point pos, double size) : pos(pos), size(size) {}
};

double distance(const Point& a, const Point& b) {
    return sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}

bool isCollision(const Point& p, double R, const vector<Obstacle>& obstacles) {
    for (const auto& obs : obstacles) {
        double dx = abs(p.x - obs.pos.x);
        double dy = abs(p.y - obs.pos.y);
        if (dx < obs.size / 2 + R && dy < obs.size / 2 + R) {
            return true;
        }
    }
    return false;
}

double aStar(const Point& start, const Point& goal, double R, const vector<Obstacle>& obstacles) {
    priority_queue<Node, vector<Node>, greater<Node>> openSet;
    openSet.emplace(start, 0, distance(start, goal));

    while (!openSet.empty()) {
        Node current = openSet.top();
        openSet.pop();

        if (distance(current.pos, goal) < 1e-6) {
            return current.g;
        }

        static const double directions[8][2] = {
            {1, 0}, {-1, 0}, {0, 1}, {0, -1},
            {1, 1}, {1, -1}, {-1, 1}, {-1, -1}
        };

        for (const auto& dir : directions) {
            Point nextPos(current.pos.x + dir[0], current.pos.y + dir[1]);
            if (!isCollision(nextPos, R, obstacles)) {
                double newG = current.g + distance(current.pos, nextPos);
                openSet.emplace(nextPos, newG, distance(nextPos, goal));
            }
        }
    }

    return 0.00;
}

int main() {
    Point start, goal;
    double R;
    cin >> start.x >> start.y >> R >> goal.x >> goal.y;

    int n;
    cin >> n;
    vector<Obstacle> obstacles;
    for (int i = 0; i < n; ++i) {
        Point pos;
        double size;
        cin >> pos.x >> pos.y >> size;
        obstacles.emplace_back(pos, size);
    }

    double result = aStar(start, goal, R, obstacles);
    cout << fixed << setprecision(2) << result << endl;

    return 0;
}
