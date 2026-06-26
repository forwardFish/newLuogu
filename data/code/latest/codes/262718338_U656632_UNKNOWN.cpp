#include<bits/stdc++.h>
#define int long long
#define endl "\n"
using namespace std;
const int maxn=1e6;
int randd()
{
	return rand()<<16 | rand();
 } 
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	srand(time(0));
	for(int i=1;i<=maxn;i++)
	{
		char c=randd()%26+'A';
		cout<<c;
	}
	return 0;
 }
