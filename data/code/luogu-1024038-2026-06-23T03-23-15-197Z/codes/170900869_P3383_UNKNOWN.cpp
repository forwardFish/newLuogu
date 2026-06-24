#include<bits/stdc++.h>
using namespace std;
#define int long long
const int maxn=1e8+5;
int a[maxn];
bool isprime[maxn];
int prime1[maxn], tot1;
void solve(int N) {
	for(int i = 2; i <= N; i++) isprime[i] = 1;
	isprime[1]=0;
	for(int i=2;i <= N;i++)
	{
		if(isprime[i]) prime1[++tot1] = i;
		for(int j = 1; j <= tot1 && i * prime1[j] <= N; j++)
		{
			isprime[i * prime1[j]] = 0;
			if(i % prime1[j] == 0) break; 
		}
	}
}
inline int read() {
    int x = 0, f = 1;
    char ch = getchar();
    while (ch < '0' || ch > '9') {
        if (ch == '-') f = -1;
        ch = getchar();
    }
    while (ch >= '0' && ch <= '9') {
        x = x * 10 + ch - '0';
        ch = getchar();
    }
    return x * f;
}
// 快写函数
inline void write(int x) {
    if (x < 0) {
        putchar('-');
        x = -x;
    }
    if (x > 9) write(x / 10);
    putchar(x % 10 + '0');
}
signed main()
{
	std::ios::sync_with_stdio(0);
	cout.tie(0);
	int n=read();
	int t=read();
	for(int i=1;i<=t;i++)
	{
		a[i]=read();
	}
	solve(n);
	int len=0;
	while(t--)
	{
		write(prime1[a[++len]]);
		cout<<endl;
	}
	return 0;
}

