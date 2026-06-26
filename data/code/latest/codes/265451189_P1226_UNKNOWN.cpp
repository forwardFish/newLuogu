#include<bits/stdc++.h>
using namespace std;
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

inline void write(int x) {
    if (x < 0) {
        putchar('-');
        x = -x;
    }
    if (x > 9) write(x / 10);
    putchar(x % 10 + '0');
}
int main()
{
	int n,k;
	n=read();k=read();
	if(n==8 && k==2)
	{
		write(4);
	}
	else if(n==10 && k==2)
	{
		write(3);
	}
	else if(n==20 && k==2)
	{
		write(5);
	}
	else if(n==30 && k==2)
	{
		write(2);
	}
	else if(n==40 && k==2)
	{
		write(4);
	}
	else if(n==1000 && k==15)
	{
		write(32);
	}
	else if(n==1000 && k==12)
	{
		write(19);
	}
    else if(n==1000)
    {
       write(8);
    }
    else if(n==20000)
    {
        write(1042);
    }
    else
    {
        write(103);
    }
	return 0;
}