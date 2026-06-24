#include<bits/stdc++.h>
using namespace std;
bool prime(int n)
{
    if (n <= 1) return false;
    for (int i = 2; i * i <= n; ++i)
	{
        if (n % i == 0) return false;
    }
    return true;
}
int cpf(int n, int p)
{
    int count = 0;
    while (n > 0) {
        n /= p;
        count += n;
    }
    return count;
}
int main() {
    int N;
    cin >> N;

    for (int i = 2; i <= N; ++i)
	{
        if (prime(i))
		{
            int c=cpf(N, i);
            if (c > 0) {
                cout << i << " " << c << endl;
            }
        }
    }

    return 0;
}
