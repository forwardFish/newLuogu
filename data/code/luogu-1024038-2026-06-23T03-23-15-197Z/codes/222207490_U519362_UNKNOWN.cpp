#include<bits/stdc++.h>
using namespace std;
#define int long long 
inline int read()
{
    int x = 0, f = 1; char ch = getchar();
    while (!isdigit(ch)) {
        if (ch == '-') f = -1;
        ch = getchar();
    }
    while (isdigit(ch)) {
        x = x * 10 + ch - '0';
        ch = getchar();
    }
    return x * f;
}
inline void write(int x)
{
    if (x < 0) {
        putchar('-');
        x = -x;
    }
    if (x > 9) write(x / 10);
    putchar(x % 10 + '0');
}
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(nullptr);
	cout.tie(nullptr);
	string s,s1;
	cin>>s;
	cout<<"1";
	for(int i=1;i<=s.size();i++)
	{
		cout<<"00";
	}
	return 0;
}
