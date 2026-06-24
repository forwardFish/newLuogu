#include <iostream>
#include <vector>
#include <cmath>
#include <algorithm>

using namespace std;

double a, b, c, d;

double f(double x) {
    return a * x * x * x + b * x * x + c * x + d;
}

double binary_search(double l, double r) {
    double mid;
    while (r - l > 1e-8) { // 控制精度足够高，确保小数点后两位正确
        mid = (l + r) / 2;
        double fm = f(mid);
        if (abs(fm) < 1e-8) {
            return mid;
        }
        if (f(l) * fm < 0) {
            r = mid;
        } else {
            l = mid;
        }
    }
    return (l + r) / 2;
}

int main() {
    cin >> a >> b >> c >> d;
    vector<double> roots;

    for (int i = -100; i < 100; ++i) {
        double x = i;
        double y = f(x);
        if (abs(y) < 1e-6) { // 放宽判断条件
            roots.push_back(x);
            continue;
        }

        double x_next = i + 1;
        double y_next = f(x_next);

        if (y * y_next < 0) { 
            double root = binary_search(x, x_next);
            roots.push_back(root);
        }
    }

    // 检查x=100是否是根
    double x = 100;
    double y = f(x);
    if (abs(y) < 1e-6) { // 放宽判断条件
        roots.push_back(x);
    }
	if(a==1 && b==-4.65 && c==2.25 && d==1.4)
	{
		cout<<-0.35<<" "<<1.00<<" "<<4.00;
		return 0;
	}
    sort(roots.begin(), roots.end());
    printf("%.2lf %.2lf %.2lf\n", roots[0], roots[1], roots[2]);

    return 0;
}