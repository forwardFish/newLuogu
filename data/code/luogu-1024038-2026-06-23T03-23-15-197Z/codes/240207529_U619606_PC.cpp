#include<bits/stdc++.h>
using namespace std;
const int maxn=1e6+5;
int sum[maxn];
int f(int x)
{
	int xx=0;
	while(x)
	{
		xx*=10;
		xx+=x%10;
		x/=10;
	}
	return xx;
}
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
int main()
{
	int l,r,k;
	cin>>l>>r>>k;
	int ans=0;
	for(int i=1;i<=k;i++)
	{
		int x=f(i);
		while(x<=r)
		{
			if(x>=l && (x*x)%k==i)
			{
				ans++;
			}
			x*=10;
		}
	}
	cout<<ans;
	return 0;
}
