#include<bits/stdc++.h>
using namespace std;
int m, n, k, l, d;
struct node{
	int x, n; 
}x[1010], y[1010];

bool cmp1(node a, node b) {
	return a.n > b.n;
}

bool cmp2(node a, node b) {
	return a.x < b.x;
}

int main() {
	cin >> m >> n >> k >> l >> d;
	for (int i = 1; i <= d; i++) {
		int x1, y1, p1, q1;
		cin >> x1 >> y1 >> p1 >> q1;
		if(x1 == p1) {
			y[min(y1, q1)].x = min(y1, q1);
			y[min(y1, q1)].n++;
		}
		if(y1 == q1) {
			x[min(x1, p1)].x = min(x1, p1);
			x[min(x1, p1)].n++;
		}
	}
	sort(x + 1, x + 1 + 1000, cmp1); 
	sort(y + 1, y + 1 + 1000, cmp1);
	sort(x + 1, x + 1 + k, cmp2);
	sort(y + 1, y + 1 + l, cmp2);
	for (int i = 1; i <= k; i++)
		cout << x[i].x << " ";
	cout << endl;
    for (int i = 1; i <= l; i++)
		cout << y[i].x << " ";
	return 0;
}