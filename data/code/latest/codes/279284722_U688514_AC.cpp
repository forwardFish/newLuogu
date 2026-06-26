#include<bits/stdc++.h>
#define int long long 
#define endl "\n"
using namespace std;
map<char,int> t1,t2;
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);

	int q;
	cin>>q;
	while(q--)
	{
		for(int i=0;i<26;i++)
		{
			t1[i+'A']=t2[i+'A']=0;
		}
		string s1,s2;
		cin>>s1>>s2;
		int n1=s1.size(),n2=s2.size();
		for(int i=0;i<n1;i++) t1[s1[i]]++;
		for(int i=0;i<n2;i++) t2[s2[i]]++;
		char a1,a2;
		cin>>a1>>a2;
		if(__gcd(t1[a1],t2[a2])==1) cout<<"YES"<<endl;
		else cout<<"NO"<<endl;
		
	 } 
	return 0;
}