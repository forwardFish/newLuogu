#include<bits/stdc++.h>
using ll=long long;
using lld=unsigned long long;
using namespace std;
inline int read()
{
    int x=0,f=1;char ch=getchar();
    while(!isdigit(ch)){if(ch=='-') f=-1;ch=getchar();}
    while(isdigit(ch)){x=x*10+ch-'0';ch=getchar();}
    return x*f;
}
inline void write(int x)
{
    if(x<0){putchar('-');x=-x;}
    if(x>9) write(x/10);
    putchar(x%10+'0');
}
#define int long long
const int mod1=19650827;
const int mod=1e9+7;
const int maxn=1e3+5;

signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int t;
	cin>>t;
	int a=0;
	while(t--)
	{
		int n,m;
		cin>>n>>m;
		
		if(n<2*m+2)
		{
			cout<<-1<<endl;
		}
		else
		{
			int ans=n+1;
			a^=ans;
			cout<<ans<<endl;
		}
	 } 
	return 0;
}







