#include<map>
#include<cstdio>
#include<cstring>
#include<iostream>
#include<algorithm>
#define MP(x,y)(make_pair(x,y))
#define LL long long
const int M=4000005;
using namespace std ;
bool notp[M] ;
int p[M],pnum,mu[M];
LL n,m,k,upp=4000000;
LL sum[M],f[M],ans ;
map < pair < LL , LL > , LL > pi ;
inline int gcd(int a , int b) {
	if(b == 0) return a ;
	return gcd(b , a % b) ;
}
inline void presolve(int n)
{
	sum[1] = 1 ;
	for(int i = 2 ; i <= n ; i ++) {
		if(!notp[i]) {
			p[++pnum] = i ;
			sum[i] = -1 ;
		}
		for(int j = 1 ; j <= pnum && 1LL * i * p[j] <= n ; j ++) {
			notp[i * p[j]] = true ;
			if(i % p[j] == 0) {
				sum[i * p[j]] = 0 ;
				break ;
			}
			else sum[i * p[j]] = - sum[i] ;
		}
	}
	for(int i = 1 ; i <= n ; i ++) {
		mu[i] = sum[i] ;
		sum[i] = sum[i - 1] + sum[i] ;
	}
	for(int i = 1 ; i <= k ; i ++) 
		f[i] = f[i - 1] + (gcd(i , k) == 1) ;
}

inline LL F(LL n) { 
	return f[k] * (n / k) + f[n % k] ;
}

inline LL Sum(LL n , LL k) {
	if(n == 0) return 0 ;
	if(k == 1 && n <= upp) return sum[n] ;
	if(pi[MP(n , k)]) return pi[MP(n , k)] ;
	LL ret = 0 ;
	if(k == 1) {
		ret = 1 ;
		for(LL l = 2 , r ; l <= n ; l = r + 1) {
			r = n / (n / l) ;
			ret -= (r - l + 1) * Sum(n / l , k) ;
		}
	}
	else {
		for(int x = 1 , y ; x * x <= k ; x ++) {
			if(k % x) continue ;
			if(mu[x]) 
				ret += Sum(n / x , x) ;
			y = k / x ;
			if(x == y) continue ;
			if(mu[y])
				ret+= Sum(n / y , y) ;
		}
	}
	pi[MP(n , k)] = ret ;
	return ret ;
}
int main() {
	scanf("%lld%lld%lld",&n,&m,&k) ;
	presolve(4000000) ;
	for(LL l = 1 , r ; l <= min(n , m) ; l = r + 1)
	{
		r = min(n / (n / l) , m / (m / l)) ;
		ans += (Sum(r , k) - Sum(l - 1 , k)) * (n / l) * F(m / l) ;
	}
	printf("%lld",ans) ;
	return 0 ;
}