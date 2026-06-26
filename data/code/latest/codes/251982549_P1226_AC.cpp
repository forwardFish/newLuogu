#include<bits/stdc++.h>
using namespace std;
#define int long long
const int mod=1e9+7;
int a,b,p;
//const int maxn=1e6+5;
//int prime[maxn], tot;
//void solve(int x) 枚举质数
//{
//	for(int i = 2; i * i <= x; i++)
//	{
//		while(x % i == 0)
//		{
//			x /= i;
//			prime[++tot] = i;
//		}
//	}
//	if(x != 1) prime[++tot] = x;
//}
//bool isprime[maxn];
//int prime1[maxn], tot1;
//void solve(int N) {
//	for(int i = 2; i <= N; i++) isprime[i] = 1;
//	isprime[1] = 0;
//	for(int i=2;i <= N;i++)
//	{
//		if(isprime[i]) prime1[++tot1] = i;
//		for(int j = 1; j <= tot1 && i * prime1[j] <= N; j++) {
//			isprime[i * prime1[j]] = 0;
//			if(i % prime1[j] == 0) break; //保证每个合数被它最小的质因数筛去
//		}
//	}
//}
//int gcd(int a, int b)
//{
//	return (a == 0 ? b : gcd(b % a, a));
//}
//int lcm(int a,int b)
//{
//	return a*b/gcd(a,b);
//}
int poww(int a,int b) { //a^b
	int ans = 1, base = a % p;
	while (b)
	{
		if (b & 1) ans= ans * base % p;
		base = base * base % p;
		b >>= 1;
	}
	return ans % p;
}
//int solve1(int l, int r){ //最大合法解
//	int ans = -1;
//	while(l <= r) {
//		int mid = l + r >> 1;
//		if(check(mid)) ans = mid, l = mid + 1;
//		else r = mid - 1;
//	}
//	return ans;
//}
//int solve2(int l, int r) //最小合法解
//{
//	int ans = -1;
//	while(l <= r) {
//		int mid = l + r >> 1;
//		if(check(mid)) ans = mid, r = mid - 1;
//		else l = mid + 1;
//	}
//	return ans;
//}
// 快读函数
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
//// 高精度加法
//void add(char* a, char* b, char* result) {
//    int len_a = strlen(a);
//    int len_b = strlen(b);
//    int max_len = max(len_a, len_b) + 1;
//    int carry = 0;
//    int index = 0;
//
//    for (int i = 0; i < max_len; ++i) {
//        int digit_a = (i < len_a) ? a[len_a - 1 - i] - '0' : 0;
//        int digit_b = (i < len_b) ? b[len_b - 1 - i] - '0' : 0;
//        int sum = digit_a + digit_b + carry;
//        result[max_len - 1 - index++] = (sum % 10) + '0';
//        carry = sum / 10;
//    }
//    result[max_len] = '\0';
//
//    // 去除前导零
//    if (result[0] == '0') {
//        memmove(result, result + 1, max_len);
//    }
//}
//
//// 高精度减法
//void sub(char* a, char* b, char* result) {
//    int len_a = strlen(a);
//    int len_b = strlen(b);
//    int max_len = len_a;
//    int borrow = 0;
//    int index = 0;
//
//    for (int i = 0; i < max_len; ++i) {
//        int digit_a = a[len_a - 1 - i] - '0';
//        int digit_b = (i < len_b) ? b[len_b - 1 - i] - '0' : 0;
//        int diff = digit_a - digit_b - borrow;
//        if (diff < 0) {
//            diff += 10;
//            borrow = 1;
//        } else {
//            borrow = 0;
//        }
//        result[max_len - 1 - index++] = diff + '0';
//    }
//    result[max_len] = '\0';
//
//    // 去除前导零
//    while (result[0] == '0' && strlen(result) > 1) {
//        memmove(result, result + 1, max_len);
//    }
//}
//// 高精度乘法
//void mul(char* a, char* b, char* result) {
//    int len_a = strlen(a);
//    int len_b = strlen(b);
//    int max_len = len_a + len_b;
//    int* temp = new int[max_len]();
//
//    for (int i = 0; i < len_a; ++i) {
//        for (int j = 0; j < len_b; ++j) {
//            temp[i + j] += (a[len_a - 1 - i] - '0') * (b[len_b - 1 - j] - '0');
//            temp[i + j + 1] += temp[i + j] / 10;
//            temp[i + j] %= 10;
//        }
//    }
//    int index = 0;
//    while (index < max_len && temp[index] == 0) ++index;
//    if (index == max_len) {
//        result[0] = '0';
//        result[1] = '\0';
//    } else {
//        for (int i = index; i < max_len; ++i) {
//            result[i - index] = temp[max_len - 1 - i + index] + '0';
//        }
//        result[max_len - index] = '\0';
//    }
//
//    delete[] temp;
//}
//// 高精度除法
//void div(char* a, int b, char* result, int& remainder)
//{
//    int len_a = strlen(a);
//    remainder = 0;
//    int index = 0;
//
//    for (int i = 0; i < len_a; ++i) {
//        remainder = remainder * 10 + (a[i] - '0');
//        result[index++] = (remainder / b) + '0';
//        remainder %= b;
//    }
//    result[index] = '\0';
//    if (result[0] == '0' && strlen(result) > 1) {
//        memmove(result, result + 1, index);
//    }
//}
//int phi(int x) //欧拉函数
//{
//	int ans=1,num=1;
//	for(int i=2;i*i<=x;i++)
//	{
//		if(!(x%i))
//		{
//			num=i-1,x/=i;
//			while(!(x%i)) num=num*i,x/=i;
//			ans=num*ans;
//		}
//	}
//	if(x!=1) ans=ans*(x-1);
//	return ans;
//}
//int a,mod;
//char b[20000005];
//inline int quickpow(int a,int b)
//{
//	long long ans=1,base=(long long)a;
//	while(b)
//	{
//		if(b&1) ans=ans*base%mod;
//		b>>=1;
//		base=base*base%mod;
//	}
//	return (int)(ans%mod);
//}
//Polya 定理 
//#define rep( i, s, t ) for( register int i = s; i <= t; ++ i )
//#define re register
//#define int long long
//int gi() {
//	char cc = getchar() ; int cn = 0, flus = 1 ;
//	while( cc < '0' || cc > '9' ) {  if( cc == '-' ) flus = - flus ; cc = getchar() ; }
//	while( cc >= '0' && cc <= '9' )  cn = cn * 10 + cc - '0', cc = getchar() ;
//	return cn * flus ;
//}
//const int P = 1e9 + 7 ; 
//int T, n ; 
//int fpow( int x, int k ) {
//	int ans = 1, base = x ; 
//	while( k ) {
//		if( k & 1 ) ans = 1ll * ans * base % P ; 
//		base = base * base % P, k >>= 1 ; 
//	} return ans ; 
//}
//int phi( int x ) {
//	int ans = x ; 
//	for( re int i = 2; i <= sqrt(x); ++ i ) {
//		if( x % i ) continue ;
//		ans = ans - ans / i ;
//		while( x % i == 0 ) x /= i ;
//	}
//	if( x != 1 ) ans = ans - ans / x ;
//	return ans ; 
//}
//void inc( int &x, int y ) {
//	( ( x += y ) >= P ) && ( x -= P ) ;
//}
//signed main()
//{
//	int T = gi() ; 
//	while( T-- ) {
//		int n = gi(), cnt = sqrt(n), Ans = 0 ; 
//		for( re int i = 1; i <= cnt; ++ i ) {
//			if( n % i ) continue ;
//			int p1 = phi(i), f1 = fpow( n, n / i ) ; 
//			f1 = f1 * p1 % P, inc( Ans, f1 ) ;
//			if( i * i != n ) {
//				int p2 = phi( n / i ), f2 = fpow( n, i ) ;
//				f2 = f2 * p2 % P, inc( Ans, f2 ) ;
//			}
//		}
//		cout << Ans * fpow( n, P - 2 ) % P << endl ; 
//	}
//	return 0 ;
//}
//Polya 定理 
signed main()
{
	std::ios::sync_with_stdio(0);
	cout.tie(0);cin.tie();
	a=read();
	b=read();
	p=read();
	cout<<a<<"^"<<b<<" mod "<<p<<"="<<poww(a,b);
	return 0;
}

