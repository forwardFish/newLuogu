#include <iostream>
#include <string>
#include <iomanip>
#include <cctype>

using namespace std;

struct ExprResult {
    char var = '\0';
    double x_coeff = 0.0;
    double const_coeff = 0.0;
};

ExprResult parse_expression(const string& expr) {
    ExprResult result;
    int sign = 1; // 当前项的符号，默认为正
    int i = 0;
    int n = expr.size();

    while (i < n) {
        // 处理符号
        if (expr[i] == '+' || expr[i] == '-') {
            int new_sign = (expr[i] == '+') ? 1 : -1;
            sign *= new_sign; // 累积符号
            i++;
            // 连续符号处理，如 "--" 转换为 "+"
            while (i < n && (expr[i] == '+' || expr[i] == '-')) {
                new_sign = (expr[i] == '+') ? 1 : -1;
                sign *= new_sign;
                i++;
            }
        }

        // 提取项的字符串
        int start = i;
        while (i < n && !(expr[i] == '+' || expr[i] == '-')) {
            i++;
        }
        string term = expr.substr(start, i - start);
        if (term.empty()) {
            term = "1"; // 处理类似 "+x" 的情况
        }

        // 解析项
        size_t var_pos = term.find_first_of("abcdefghijklmnopqrstuvwxyz");
        if (var_pos != string::npos) {
            // 处理未知数项
            result.var = term[var_pos];
            string coeff_str = term.substr(0, var_pos);
            double coeff = 1.0;
            if (!coeff_str.empty()) {
                coeff = stod(coeff_str);
            }
            result.x_coeff += sign * coeff;
        } else {
            // 处理常数项
            if (!term.empty()) {
                double coeff = stod(term);
                result.const_coeff += sign * coeff;
            }
        }

        sign = 1; // 重置符号
    }

    return result;
}

int main() {
    string equation;
    getline(cin, equation);

    size_t equal_pos = equation.find('=');
    string left_expr = equation.substr(0, equal_pos);
    string right_expr = equation.substr(equal_pos + 1);

    ExprResult left = parse_expression(left_expr);
    ExprResult right = parse_expression(right_expr);

    // 合并方程: ax + b = cx + d → (a - c)x + (b - d) = 0
    double total_x = left.x_coeff - right.x_coeff;
    double total_const = right.const_coeff - left.const_coeff;

    char var = (left.var != '\0') ? left.var : right.var;

    if (total_x == 0) {
        cout << var << "=0.000" << endl;
    } else {
        double ans = total_const / total_x;
        cout << var << "=" << fixed << setprecision(3) << ans << endl;
    }

    return 0;
}