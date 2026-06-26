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
const int maxn=1e5+5;
int cnt[4];
int s[maxn];
int b[maxn];
int a[maxn][4]; 
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
		memset(cnt,0,sizeof(cnt));
		memset(s,0,sizeof(s));
		for(int i=1;i<=n;i++)
		{
			b[i]=INT_MAX;
		}
		int ans=0;
		for(int i=1;i<=n;i++)
		{
			int pd=0;
			for(int j=1;j<=3;j++)
			{
				cin>>a[i][j];
				if(!pd || a[i][j]>a[i][pd])
				{
					pd=j;
				}
			}
			cnt[pd]++;
			ans+=a[i][pd];
			s[i]=pd;
		}
		int d=-1;
		if(cnt[1]>n/2) d=1;
		if(cnt[2]>n/2) d=2;
		if(cnt[3]>n/2) d=3;
		for(int i=1;i<=n;i++)
		{
			if(s[i]==d)
			{
				int minn=INT_MAX;
				for(int j=1;j<=3;j++)
				{
					if(j!=d)
					{
						minn=min(minn,a[i][d]-a[i][j]);
					}

				}
				b[i]=minn;
			}
		}
		sort(b+1,b+n+1);
		for(int i=1;i<=cnt[d]-n/2;i++)
		{
			ans-=b[i];
		}
		cout<<ans<<'\n';
	}
	return 0;
}







