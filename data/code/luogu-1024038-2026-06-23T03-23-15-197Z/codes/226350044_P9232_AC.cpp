#include <cstdio>
#include <cstring>

const int maxn= 5001;

char a[maxn];

bool check(int l, int r) {
	while (l < r) {
		if 		(a[l] > a[r]) return true;
		else if (a[l] < a[r]) return false;
		l++, r--;
	}
	return false;
}

int main() {
	scanf("%s", a);
	int n = strlen(a) - 1;
	int cnt = 0;
	for (int i = 0; i < n; ++i) {
		for (int j = i + 1; j <= n; ++j) {
			cnt += check(i, j);
		}
	}
	printf("%d", cnt);
	return 0;
}