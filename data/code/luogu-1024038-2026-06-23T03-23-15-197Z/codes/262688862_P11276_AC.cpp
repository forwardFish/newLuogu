#include<bits/stdc++.h>
#define int long long
#define endl "\n"
using namespace std;
const int maxn=1e6+5;
int bo[maxn*2];
int a(string s)
{
	int n=s.size();
	for(int i=1;i<n;i++)
	{
		int j=bo[i-1];
		while(j>0 && s[i]!=s[j]) j=bo[j-1];
		if(s[i]==s[j]) j++;
		bo[i]=j;
	}
	return n;
}
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	string s;
	cin>>s;
	int n=a(s);
	int k=n-bo[n-1];
	cout<<s;
	for(int i=n-k;i<=n-1;i++) cout<<s[i];
	return 0;
 }
