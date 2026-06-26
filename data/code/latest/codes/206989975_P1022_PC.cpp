#include <iostream>
#include <string>
#include <iomanip>

using namespace std;

struct ExprResult {
    char var;
    double x_coeff;
    double const_coeff;
};

ExprResult parse_expression(const string& expr) {
    ExprResult result;
    result.var = '\0';
    result.x_coeff = 0.0;
    result.const_coeff = 0.0;

    if (expr.empty()) {
        return result;
    }

    string processed_expr;
    if (expr[0] != '+' && expr[0] != '-') {
        processed_expr = "+" + expr;
    } else {
        processed_expr = expr;
    }

    int i = 0;
    while (i < processed_expr.size()) {
        char sign_char = processed_expr[i];
        int sign = (sign_char == '+') ? 1 : -1;
        i++;

        int j = i;
        while (j < processed_expr.size() && processed_expr[j] != '+' && processed_expr[j] != '-') {
            j++;
        }

        string term_str = processed_expr.substr(i, j - i);
        i = j;

        size_t alpha_pos = term_str.find_first_of("abcdefghijklmnopqrstuvwxyz");
        if (alpha_pos != string::npos) {
            char current_var = term_str[alpha_pos];
            string num_str = term_str.substr(0, alpha_pos);
            double num;

            if (num_str.empty() || num_str == "+" || num_str == "-") {
                num = 1;
            } else {
                num = stod(num_str);
            }

            // Handle negative sign if present in num_str
            if (!num_str.empty() && num_str[0] == '-') {
                num *= -1;
                sign *= 1; // Since the sign is already captured in sign_char
            }

            result.x_coeff += num * sign;

            if (result.var == '\0') {
                result.var = current_var;
            }
        } else {
            if (!term_str.empty()) {
                double num = stod(term_str);
                result.const_coeff += num * sign;
            }
        }
    }

    return result;
}

int main() {
    string equation;
    cin >> equation;

    size_t equal_pos = equation.find('=');
    string left_expr = equation.substr(0, equal_pos);
    string right_expr = equation.substr(equal_pos + 1);

    ExprResult left_result = parse_expression(left_expr);
    ExprResult right_result = parse_expression(right_expr);

    char var = '\0';
    if (left_result.var != '\0') {
        var = left_result.var;
    } else {
        var = right_result.var;
    }

    double total_x = left_result.x_coeff - right_result.x_coeff;
    double total_const = right_result.const_coeff - left_result.const_coeff;

    if (total_x == 0) {
        // 根据题目描述，保证有解，所以这里不会执行
        cout << var << "=0.000" << endl;
        return 0;
    }

    double solution = total_const / total_x;

    cout << var << "=" << fixed << setprecision(3) << solution << endl;

    return 0;
}