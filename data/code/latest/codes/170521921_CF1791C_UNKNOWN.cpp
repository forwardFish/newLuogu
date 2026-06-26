#include<bits/stdc++.h>
using namespace std;
int t,n,l,r,ans;
int a[2005];
string s;
int main()
{
	cin>>t;
	while(t--)
	{
		cin>>n;
		cin>>s;
		s=' '+s;
		for(int i=1;i<=n;i++)
		{
			a[i]=s[i]-'0'; 
		}
		l=1;r=n;ans=n;
		while(l<=r)
		{
			if(a[l]!=a[r]) ans-=2,l++,r--;
			else break;
		}
		cout<<ans<<endl;
	} 
	return 0;
}
