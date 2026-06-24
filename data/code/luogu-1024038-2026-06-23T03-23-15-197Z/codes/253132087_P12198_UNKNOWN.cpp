#include<bits/stdc++.h>
//#pragma GCC optimize(2)
#define int long long
using namespace std;
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int n=1e5，l=20;
	cout<<n<<" "<<l<<endl;
	srand(time(0));
	for (int i=1;i<=n;i++) putchar('a'+rand()%26);
	return 0;
}

