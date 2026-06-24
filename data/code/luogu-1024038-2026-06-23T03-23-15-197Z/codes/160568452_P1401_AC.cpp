#include <iostream>
using namespace std;

int main() {
    int x_l, x_u, y_l, y_u;
    cin >> x_l >> x_u >> y_l >> y_u;
    
    // 定义 int 类型的上下界
    const long long int INT_MIN = -2147483648;
    const long long int INT_MAX = 2147483647;
    
    // 检查四种组合的乘积
    long long int p1 = (long long int)x_l * y_l;
    long long int p2 = (long long int)x_l * y_u;
    long long int p3 = (long long int)x_u * y_l;
    long long int p4 = (long long int)x_u * y_u;
    
    // 检查是否有任何一个乘积超出 int 的范围
    if (p1 < INT_MIN || p1 > INT_MAX ||
        p2 < INT_MIN || p2 > INT_MAX ||
        p3 < INT_MIN || p3 > INT_MAX ||
        p4 < INT_MIN || p4 > INT_MAX) {
        cout << "long long int" << endl;
    } else {
        cout << "int" << endl;
    }
    
    return 0;
}
