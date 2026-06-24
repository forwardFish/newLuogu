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
#define endl "\n"
const int mod1=19650827;
const int mod=1e9+7;
const int maxn=1e6+5;
int a[maxn];

signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int t;
	cin>>t;
	while(t--)
	{
		int n;
		cin>>n;
		for(int i=1;i<=n;i++)
		{
			cin>>a[i];
		}
		unordered_map<int,int> t;
		int l=1,r=1;int ans=0;
		while(r<=n)
		{
			t[a[r]]++;

			while(t[a[r]]>1)
			{
				t[a[l]]--;
				l++;
			}
			ans=max(ans,r-l+1);
			r++;
		}
		cout<<ans<<endl;
	}
	return 0;
}







