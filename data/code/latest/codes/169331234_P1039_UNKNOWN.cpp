#include <iostream>
#include <vector>
#include <string>
#include <map>
#include <set>

using namespace std;

// 定义证词类型
enum StatementType {
    I_AM_GUILTY,
    I_AM_NOT_GUILTY,
    XXX_IS_GUILTY,
    XXX_IS_NOT_GUILTY,
    TODAY_IS_XXX
};

// 解析证词类型
StatementType parseStatementType(const string& statement) {
    if (statement == "I am guilty.") return I_AM_GUILTY;
    if (statement == "I am not guilty.") return I_AM_NOT_GUILTY;
    if (statement.find(" is guilty.") != string::npos) return XXX_IS_GUILTY;
    if (statement.find(" is not guilty.") != string::npos) return XXX_IS_NOT_GUILTY;
    if (statement.find("Today is ") != string::npos) return TODAY_IS_XXX;
    return StatementType(-1); // 无效证词
}

// 解析证词中的名字
string parseName(const string& statement) {
    size_t pos = statement.find(" is");
    if (pos != string::npos) return statement.substr(0, pos);
    pos = statement.find("Today is ");
    if (pos != string::npos) return statement.substr(pos + 9);
    return "";
}

int main() {
    int M, N, P;
    cin >> M >> N >> P;
    vector<string> names(M);
    map<string, vector<string>> statements;
    set<string> days = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};

    for (int i = 0; i < M; ++i) {
        cin >> names[i];
    }

    cin.ignore(); // 忽略换行符

    for (int i = 0; i < P; ++i) {
        string line;
        getline(cin, line);
        size_t pos = line.find(": ");
        string name = line.substr(0, pos);
        string statement = line.substr(pos + 2);
        statements[name].push_back(statement);
    }

    // 推理过程
    set<string> possible_culprits;
    for (const auto& name : names) {
        int lie_count = 0;
        for (const auto& statement : statements[name]) {
            StatementType type = parseStatementType(statement);
            string target = parseName(statement);
            if (type == I_AM_GUILTY && name != target) lie_count++;
            if (type == I_AM_NOT_GUILTY && name == target) lie_count++;
            if (type == XXX_IS_GUILTY && name != target) lie_count++;
            if (type == XXX_IS_NOT_GUILTY && name == target) lie_count++;
            if (type == TODAY_IS_XXX && days.find(target) == days.end()) lie_count++;
        }
        if (lie_count <= N) {
            possible_culprits.insert(name);
        }
    }

    if (possible_culprits.size() == 1) {
        cout << *possible_culprits.begin() << endl;
    } else if (possible_culprits.size() > 1) {
        cout << "Cannot Determine" << endl;
    } else {
        cout << "Impossible" << endl;
    }

    return 0;
}
