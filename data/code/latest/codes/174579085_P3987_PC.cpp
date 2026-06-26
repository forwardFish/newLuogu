#include<bits/stdc++.h>
using namespace std;
const int MAXN=1e5+5;
const int MAXA=5e5+5;
int n,m;
vector<int> a(MAXN);
inline char getch()
{
    static char buf[1 << 20], *p1 = buf, *p2 = buf;
    return p1 == p2 && (p2 = (p1 = buf) + fread(buf, 1, 1 << 20, stdin), p1 == p2) ? EOF : *p1++;
}

inline int read()
{
    int x = 0, f = 1; char ch = getch();
    while (ch < '0' || ch > '9') { if (ch == '-') f = -1; ch = getch(); }
    while (ch >= '0' && ch <= '9') { x = x * 10 + ch - '0'; ch = getch(); }
    return x * f;
}

inline void write(long long x)
{
    static char buf[20];
    int len = 0;
    if (x < 0) { putchar('-'); x = -x; }
    do { buf[len++] = x % 10 + '0'; x /= 10; } while (x);
    while (len) putchar(buf[--len]);
}
int main()
{
    n=read();m=read();
    for (int i=1;i<=n;++i)
	{
        a[i]=read();
    }
    while (m--)
	{
        int op=read(),l=read(),r=read();
        if (op == 1)
		{
            int x=read();
            for (int i=l;i<=r;++i)
			{
                if (a[i] % x == 0)
				{
                    a[i]/=x;
                }
            }
        }
		else if (op==2)
		{
            long long sum=0;
            for (int i=l;i<=r;++i)
			{
                sum+=a[i];
            }
            write(sum);
			putchar('\n');
        }
    }
    return 0;
}
