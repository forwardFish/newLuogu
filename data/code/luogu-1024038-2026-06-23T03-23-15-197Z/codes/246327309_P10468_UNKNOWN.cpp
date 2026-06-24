#include<bits/stdc++.h>
#define int unsigned long long 
using namespace std;
const int maxn=1e6+5;
int a[maxn],p[maxn];;
int P=131;
int f(int l,int r)
{
	return a[r]-a[l-1]*p[r-l+1];
}
signed main()
{
	string s;
	cin>>s;
	int n=s.size();
	s=' '+s;;;
	p[0]=1; 
	for(int i=1;i<=n;i++)
	{
		p[i]=p[i-1]*P;
		a[i]=a[i-1]*P+s[i];
	}
	int q;
	cin>>q;
	while(q--)
	{
		 int l1,r1,l2,r2;
		 cin>>l1>>r1>>l2>>r2;
		 if(f(l1,r1)==f(l2,r2))
		 {
		 	cout<<"Yes\n";
		  } 
		  else
		  {
		  	cout<<"No\n";
		  }
	}
	return 0;
}
