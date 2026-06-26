#include<bits/stdc++.h>
using namespace std;
#define int long long
const int maxn=1e8+5;
int a[maxn];
bool isprime[maxn];
int prime1[maxn], tot1;
void solve(int N) {
	for(int i = 2; i <= N; i++) isprime[i] = 1;
	isprime[1]=0;
	for(int i=2;i <= N;i++)
	{
		if(isprime[i]) prime1[++tot1] = i;
		for(int j = 1; j <= tot1 && i * prime1[j] <= N; j++)
		{
			isprime[i * prime1[j]] = 0;
			if(i % prime1[j] == 0) break; 
		}
	}
}
signed main()
{
	std::ios::sync_with_stdio(0);
	cout.tie(0);cin.tie();
	int n;
	int t;
	cin>>n>>t;
	for(int i=1;i<=t;i++)
	{
		cin>>a[i];
	}
	solve(n);
	int len=0;
	while(t--)
	{
		cout<<prime1[a[++len]]<<endl;
	}
	return 0;
}

