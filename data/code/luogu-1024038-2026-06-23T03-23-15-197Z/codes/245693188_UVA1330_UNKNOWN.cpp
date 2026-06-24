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
char c[maxn][maxn];
int l[maxn][maxn];
int r[maxn][maxn];
int h[maxn][maxn];
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int t;
	cin>>t;
	while(t--)
	{
		int n,m;
		cin>>n>>m;
		for(int i=1;i<=n;i++)
		{
			for(int j=1;j<=m;j++)
			{
				cin>>c[i][j];
				h[i][j]=1;r[i][j]=l[i][j]=j;
			}
			for(int j=2;j<=m;j++)
			{
				if(c[i][j]=='F' && c[i][j-1]=='F')
				{
					l[i][j]=l[i][j-1];
				}
			}
			for(int j=m-1;j>=1;j--)
			{	
				if(c[i][j]=='F' && c[i][j+1]=='F')
				{
					r[i][j]=r[i][j+1];
				}
			}
		 }
		 int ans=0;
		 for(int i=1;i<=n;i++)
		 {
		 	for(int j=1;j<=m;j++)
		 	{
		 		if(i>1 && c[i][j]=='F')
		 		{
		 			if(c[i-1][j]=='F')
		 			{
		 				h[i][j]=h[i-1][j]+1;
						 l[i][j]=max(l[i][j],l[i-1][j]);
						 r[i][j]=min(r[i][j],r[i-1][j]);
					 }
					 ans=max(ans,(r[i][j]-l[i][j]+1)*h[i][j]);
				 }
			 }
		  } 
		  cout<<ans*3<<endl;
	}
	
	return 0;
}