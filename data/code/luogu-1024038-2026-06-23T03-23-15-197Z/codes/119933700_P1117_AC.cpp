#include <bits/stdc++.h>
using namespace std;

typedef long long ll;
const int N = 50010;

int n, a[N], b[N];
char s[N];

struct SA {
int sa[N], height[N], tong[N], rnk[N], tp[N], f[N][16], LG[N];
int m;
void radix_sort() {
	for(int i = 1; i <= m; ++i) tong[i] = 0;
	for(int i = 1; i <= n; ++i) tong[rnk[i]]++;
	for(int i = 1; i <= m; ++i) tong[i] += tong[i - 1];
	for(int i = n; i; --i) sa[tong[rnk[tp[i]]]--] = tp[i];
}
int query(int l, int r) {
	l = rnk[l], r = rnk[r];
	if(l > r) swap(l, r);  ++l;
	int k = LG[r - l + 1];
	return min(f[l][k], f[r - (1 << k) + 1][k]);
}
void init() {
	memset(sa, 0, sizeof(sa)); 
	memset(height, 0, sizeof(height));
	memset(tong, 0, sizeof(tong));
	memset(rnk, 0, sizeof(rnk));
	memset(tp, 0, sizeof(tp));
	memset(f, 0, sizeof(f));
	memset(LG, 0, sizeof(LG));
}
void build(char *A) {
	init();
	for(int i = 1; i <= n; ++i) rnk[i] = A[i], tp[i] = i;
	m = 200; radix_sort();
	for(int w = 1, p = 0; w <= n && p < n; m = p, w <<= 1) {
		p = 0;
		for(int i = 1; i <= w; ++i) tp[++p] = n - w + i;
		for(int i = 1; i <= n; ++i) if(sa[i] > w) tp[++p] = sa[i] - w;
		radix_sort(); swap(tp, rnk); rnk[sa[1]] = p = 1;
		for(int i = 2; i <= n; ++i) 
			rnk[sa[i]] = (tp[sa[i]] == tp[sa[i - 1]] && tp[sa[i] + w] == tp[sa[i - 1] + w]) ? p : ++p; 
	}
	for(int i = 1, k = 0; i <= n; ++i) {
		if(k) --k; int j = sa[rnk[i] - 1];
		while(A[i + k] == A[j + k] && i + k <= n && j + k <= n) ++k;
		height[rnk[i]] = k;
	}
	for(int i = 2; i <= n; ++i) LG[i] = LG[i >> 1] + 1;
	for(int i = 1; i <= n; ++i) f[i][0] = height[i];
	for(int j = 1; j <= 15; ++j)
		for(int i = 1; i + (1 << j) - 1 <= n; ++i) {
			f[i][j] = min(f[i][j - 1], f[i + (1 << (j - 1))][j - 1]);
		}
}
}A, B;

int main() {
	int T = 0; scanf("%d", &T); while(T--) {
		memset(a, 0, sizeof(a));
		memset(b, 0, sizeof(b));
		scanf("%s", s + 1); n = strlen(s + 1);
		A.build(s); reverse(s + 1, s + n + 1); B.build(s);
		for(int len = 1; len <= (n >> 1); ++len) {
			for(int i = len, j = i + len; j <= n; i += len, j += len) {
				int LCS = min(len - 1, B.query(n - i + 2, n - j + 2)), LCP = min(len, A.query(i, j));
				if(LCS + LCP >= len) {
					int t = LCP + LCS - len + 1;
					a[i - LCS]++; a[i - LCS + t]--;
					b[j + LCP - t]++; b[j + LCP]--;
				}
			}
		}
		for(int i = 1; i <= n; ++i) a[i] += a[i - 1], b[i] += b[i - 1];
		ll ans = 0;
		for(int i = 1; i < n; ++i) ans += 1LL * b[i] * a[i + 1];
		printf("%lld\n", ans);
	}
	return 0;
}