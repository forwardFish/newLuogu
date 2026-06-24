#include <iostream>
#include <string>
#include <iomanip>
#include <sstream>
#include <cctype>

using namespace std;

struct ExprResult {
    char var = '\0';
    double x_coeff = 0.0;
    double const_coeff = 0.0;
};

ExprResult parse_expression(const string& expr) {
    ExprResult result;
    stringstream ss(expr);
    char ch;
    double num;
    string token;

    // 预处理符号，确保每个项前有明确符号
    string processed_expr;
    for (int i = 0; i < expr.size(); i++) {
        if (i == 0 && expr[i] != '+' && expr[i] != '-') {
            processed_expr += '+';
        }
        if (expr[i] == '=' || expr[i] == ' ') continue;
        processed_expr += expr[i];
        if (i < expr.size()-1 && (expr[i+1] == '+' || expr[i+1] == '-') && !isalnum(expr[i])) {
            processed_expr += ' ';
        }
    }

    ss.str(processed_expr);
    while (ss >> token) {
        bool is_negative = false;
        if (token[0] == '+') {
            token = token.substr(1);
        } else if (token[0] == '-') {
            is_negative = true;
            token = token.substr(1);
        }

        size_t var_pos = token.find_first_of("abcdefghijklmnopqrstuvwxyz");
        if (var_pos != string::npos) {
            // 处理未知数项
            result.var = token[var_pos];
            string coeff_str = token.substr(0, var_pos);
            double coeff = 1.0;
            if (!coeff_str.empty()) {
                coeff = stod(coeff_str);
            }
            if (is_negative) coeff *= -1;
            result.x_coeff += coeff;
        } else {
            // 处理常数项
            if (!token.empty()) {
                double coeff = stod(token);
                if (is_negative) coeff *= -1;
                result.const_coeff += coeff;
            }
        }
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