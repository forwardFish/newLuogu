#include<bits/stdc++.h>
#define int long long
#define endl "\n" 
using namespace std;
const int maxn=1e6+5;
int bo[maxn*2],ans[maxn];
void a(string s)
{
	int n=s.size();
	for(int i=1;i<n;i++)
	{
		int j=bo[i-1];
		while(j>0 && s[i]!=s[j]) j=bo[j-1];
		if(s[i]==s[j]) j++;
		bo[i]=j;
	}
}
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);
	string s1,s2;cin>>s1>>s2;
	string s=s2+'#'+s1;
	int n1=s1.size(),n2=s2.size();
	a(s);
	int l=0;
	for(int i=n2+1;i<=n1+n2;i++)
	{
		if(bo[i]==n2) ans[++l]=(i-2*n2+1);
	}
	for(int i=1;i<=l;i++) cout<<ans[i]<<endl;
	memset(bo,0,sizeof(bo));
	a(s2);
	for(int i=0;i<n2;i++) cout<<bo[i]<<" ";
	return 0;
 } 