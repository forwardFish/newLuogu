#include <bits/stdc++.h>
using namespace std;

const int MAXN = 100000 + 5;
int n, k;
int doc[MAXN], temp[MAXN];
int cnt;

int main()
{
    for (int i = 1; i < MAXN; i++) doc[i] = i;
    cin >> n >> k;
    for (int oper = 0; oper < k; oper++)
    {
        int s, t, p1, p2, ins, len;
        cin >> s >> t >> ins;
        len = t - s + 1;
        p1 = ins + 1;
        p2 = p1 + len - 1;
        cnt = 0;
        for (int i = s; i <= t; i++) temp[++cnt] = doc[i];
        if (ins < s) for (int i = s - 1; i >= p1; i--) doc[i + len] = doc[i];
        else for (int i = t + 1; i <= p2; i++) doc[i - len] = doc[i];
        for (int i = p2; i >= p1; i--) doc[i] = temp[cnt--];
    }
    for (int i = 1; i <= 10; i++) cout << doc[i] << endl;
    return 0;
}