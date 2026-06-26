#include <cstdio>
#include <cstring>
#include <iostream>
#include <algorithm>
using namespace std;
const int M = 100005;
int read()
{
	int x=0,f=1;char c;
	while((c=getchar())<'0' || c>'9') {if(c=='-') f=-1;}
	while(c>='0' && c<='9') {x=(x<<3)+(x<<1)+(c^48);c=getchar();}
	return x*f;
}
int n,d,k,id[M],a[M][105],b[105][105];
int cal(int x,int y)
{
	int r=0;
	for(int i=1;i<=d;i++)
		r+=a[x][i]*a[y][i];
	return r;
}
int check(int x)
{
	int r=0;
	for(int i=1;i<=d;i++)
		for(int j=1;j<=d;j++)
		{
			r+=b[i][j]*a[x][i]*a[x][j];
			b[i][j]+=a[x][i]*a[x][j];
		}
	return r%k;
}
signed main()
{
	n=read();d=read();k=read();
	for(int i=1;i<=n;i++)
		for(int j=1;j<=d;j++)
			a[i][j]=read()%k;
	for(int t=1;t<=10;t++)
	{
		memset(b,0,sizeof b);
		for(int i=1;i<=n;i++) id[i]=i;
		random_shuffle(id+1,id+1+n);
		for(int i=1;i<=n;i++)
			if(check(id[i])!=(i-1)%k)
			{
				for(int j=1;j<i;j++)
					if(cal(id[i],id[j])%k==0)
					{
						if(id[i]>id[j]) swap(i,j);
						printf("%d %d\n",id[i],id[j]);
						return 0;
					}
			}
	}
	puts("-1 -1");
}