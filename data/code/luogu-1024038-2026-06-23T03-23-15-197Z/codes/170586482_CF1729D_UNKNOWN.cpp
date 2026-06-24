#include <bits/stdc++.h>
using namespace std;
int n, x[100001], y[100001], c[100001];
int main(){
	int t;
	scanf("%d", &t);
	while (t--){
		scanf("%d", &n);
		for (int i=1; i<=n; i++) cin>>x[i];
		for (int i=1; i<=n; i++) 
		{
			cin>>y[i];
			c[i] = y[i] - x[i];
		}
		sort(c + 1, c + n + 1);
		int cnt = 0, l = 1, r = n;
		while (l < r)
		{
			while (c[l] + c[r] < 0 && l < r) 
			{
				l++;
			}
			if (l==r) break;
			if (c[l] + c[r] >= 0) cnt++;
			l++, r--; 
		}
		cout<<cnt<<endl;
	}
	return 0;
}