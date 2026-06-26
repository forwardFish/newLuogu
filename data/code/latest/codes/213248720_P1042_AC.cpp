#include<bits/stdc++.h>
using namespace std;
string s;
char c;
void solve (int k) {
    int a=0, b=0;
    for (char i:s) {
		i=='W'?a++:b++;
		if (max(a, b)>=k&&abs(a-b)>=2)
			cout << a << ':' << b << '\n',
			a=b=0;
	}
	cout << a << ':' << b << "\n\n";
}
int main () {
	while (cin >> c&&c!='E') s+=c; 
    solve(11); solve(21);
	return 0;
}