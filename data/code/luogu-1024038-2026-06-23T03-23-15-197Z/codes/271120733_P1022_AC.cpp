
#include <iostream>
#include <string>
#include <cstdio>
#include <cctype>

using namespace std;

int main() {
    string s;
    // Read the equation string. Since there are no spaces in the equation, cin >> s works.
    if (!(cin >> s)) return 0;
    
    char var = 0;
    // Identify the variable (the lowercase letter in the equation)
    for (char c : s) {
        if (islower(c)) {
            var = c;
            break;
        }
    }
    
    double coeff = 0;   // Accumulates the coefficient of the variable
    double constant = 0; // Accumulates the constant terms
    
    int side = 1;       // 1 for Left Hand Side, -1 for Right Hand Side
    int sign = 1;       // 1 for positive term, -1 for negative term
    double num = 0;     // Current number being parsed from digits
    bool has_num = false; // Flag to indicate if we are currently parsing a number
    bool last_is_var = false; // Flag to indicate if the last processed term was a variable term
    
    // Iterate through the string. 
    // We go up to s.length() to process the last term using a virtual delimiter (c = 0).
    for (size_t i = 0; i <= s.length(); ++i) {
        char c = (i < s.length()) ? s[i] : 0; 
        
        if (isdigit(c)) {
            num = num * 10 + (c - '0');
            has_num = true;
            last_is_var = false;
        } else if (islower(c)) {
            last_is_var = true;
            // has_num remains as is: true if coefficient exists (e.g., 2x), false if implicit 1 (e.g., x)
        } else {
            // Delimiter encountered: +, -, =, or end of string.
            // Finalize the term that ended just before this delimiter.
            
            if (last_is_var) {
                // The term was a variable term
                double val = has_num ? num : 1;
                coeff += side * sign * val;
            } else {
                // The term was a constant term
                if (has_num) {
                    constant += side * sign * num;
                }
            }
            
            // Reset state for the next term
            num = 0;
            has_num = false;
            last_is_var = false;
            
            // Update parsing state based on the delimiter for the *next* term
            if (c == '=') {
                side = -1; // Switch to RHS. Terms on RHS are effectively subtracted when moved to LHS.
                sign = 1;  // Reset sign for the start of the new side
            } else if (c == '+') {
                sign = 1;
            } else if (c == '-') {
                sign = -1;
            }
            // If c == 0, the loop terminates
        }
    }
    
    // The equation is now reduced to the form: coeff * x + constant = 0
    // Solving for x: x = -constant / coeff
    double result = -constant / coeff;
    
    // Output the result formatted to 3 decimal places
    printf("%c=%.3f\n", var, result);
    
    return 0;
}
