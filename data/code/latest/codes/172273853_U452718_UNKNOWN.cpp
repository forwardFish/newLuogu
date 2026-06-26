#include<bits/stdc++.H>
using namespace std;
typedef unsigned long long ULL;
const int N=100010,P = 131;
int n, k, hh;
string s[N] , t;
ULL p[N], h[N];
ULL a[N];
set<ULL> w;
 
ULL get(int l, int r)
{
	return h[r] - h[l - 1] * p[r - l + 1];
}
 
signed main()
{
	cin >> n >> k;
	for(int i = 1; i <= n; i ++ )  cin >> s[i];
	p[0] = 1;
	for(int i = 1; i <= 10; i ++ )  p[i] = p[i - 1] * P;
	if(k == 3)
	{
		for(int i = 1; i <= n; i ++ )
		{
			for(int j = 1; j <= n; j ++ )
			{
				if(i == j)  continue;
				for(int o = 1; o <= n; o ++ )
				{
					if(o == j || o == i)  continue;
					t.clear();
					t += s[i] + s[j] + s[o];
					for(int q = 1; q <= t.size(); q ++ )  h[q] = h[q - 1] * P + t[q - 1]; 
					ULL x = get(1, t.size());
					w.insert(x);
				}
			}
		}
		cout << w.size() << endl;
	}
	else if(k == 4)
	{
		for(int i = 1; i <= n; i ++ )
		{
			for(int j = 1; j <= n; j ++ )
			{
				if(i == j)  continue;
				for(int o = 1; o <= n; o ++ )
				{
					if(o == i || o == j)  continue;
					for(int g = 1; g <= n; g ++ )
					{
						if(g == o || g == j || g == i)  continue;
						t.clear();
						t += s[i] + s[j] + s[o] + s[g];
						for(int q = 1; q <= t.size(); q ++ )	h[q] = h[q - 1] * P + t[q - 1];
						ULL x = get(1, t.size());
						w.insert(x);
					}
				}
			}
		}
		cout << w.size() << endl;
	}
	else if(k == 2)
	{
		for(int i = 1; i <= n; i ++ )
		{
			for(int j = 1; j <= n; j ++ )
			{
				if(j == i)  continue;
				t.clear();
				t += s[i] + s[j];
				for(int q = 1; q <= t.size(); q ++ )  h[q] = h[q - 1] * P + t[q - 1];
				ULL x = get(1, t.size());
				w.insert(x);
			}
		}
		cout << w.size() << endl;
	}
	else if(k == 1)
	{
		for(int i = 1; i <= n; i ++ )
		{
			t.clear();
			t += s[i];
			for(int q = 1; q <= t.size(); q ++ )  h[q] = h[q - 1] * P + t[q - 1];
			ULL x = get(1, t.size());
			w.insert(x);
		}
		cout << w.size() << endl;
	}
}