#include<bits/stdc++.h>
using namespace std;
using ll=long long;
using lld=unsigned long long;
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
int f[maxn][maxn],ans,cnt1=1,cnt2=1,vis[maxn],ma[maxn],n,m,a[maxn][maxn];
char c[maxn][maxn];
int dfs(int x)
{
	for(int i=1;i<=cnt1;i++)
	{
		if(vis[i]||!f[x][i]) continue;
		vis[i]=1;
		if(!ma[i]||dfs(ma[i]))
		{
			ma[i]=x;return 1;
		}
	}
	return 0;
}
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int t;
	cin>>t;
	for(int k=1;k<=t;k++)
	{
		cin>>n>>m;ans=0;cnt2=cnt1=1;
		memset(f,0,sizeof(f));
		memset(ma,0,sizeof(ma));
		memset(a,0,sizeof(a));
	    for(int i=1;i<=n;i++)
		{
	    	for(int j=1;j<=m;j++)
			{
	    		cin>>c[i][j];
				if(c[i][j]=='o')
				{
					a[i][j]=cnt1;
				}
				if(c[i][j]=='#')
				{
					cnt1++;
				}
			}
			cnt1++;
		}
		for(int j=1;j<=m;j++)
		{
			for(int i=1;i<=n;i++)
			{
				if(c[i][j]=='o')
				{
					f[cnt2][a[i][j]]=1;
				}
				if(c[i][j]=='#')
				{
					cnt2++;
				}
			}
			cnt2++;
		}
		for(int i=1;i<=cnt2;i++)
		{
			memset(vis,0,sizeof(vis));
			ans+=dfs(i);
		}
		cout<<"Case :"<<k<<'\n'<<ans<<'\n';
	}
    return 0;
}
