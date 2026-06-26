#include<bits/stdc++.h>
#define LL long long
using namespace std;
inline void read(int &x){
	x=0;int f=1;char c=getchar();
	while(c>'9'||c<'0'){if(c=='-') f=-1;c=getchar();	}
	while(c>='0'&&c<='9') x=(x<<1)+(x<<3)+(c^48),c=getchar();
	x*=f;
}
struct node{
	int num,tim;
}e[22][22];
int n,m;
int mac[22][40000];
int ord[400];
int now[22];
int be[22];

int main()
{
	read(m),read(n);  int tmp=n*m;
	for(int i=1;i<=tmp;i++) read(ord[i]);
	for(int i=1;i<=n;i++)
		for(int j=1;j<=m;j++)
			read(e[i][j].num);
			
	for(int i=1;i<=n;i++)
		for(int j=1;j<=m;j++)
			read(e[i][j].tim);
			
	int ans=0;
	for(int i=1;i<=tmp;i++)
	{
		int whi=ord[i]; 
		int wha=(++now[whi]);
		
		int ma=e[whi][wha].num;
		int go=e[whi][wha].tim;
		
		int cnt=0,end;
		for(int j=be[whi]+1;;j++)
		{
			if(mac[ma][j]==0) cnt++;
			else cnt=0;
			if(cnt==go)
			{
				end=j;
				break;
			}
		}
		for(int j=end-go+1;j<=end;j++) mac[ma][j]=1;
		be[whi]=end;
		ans=max(ans,end);
	}
	cout<<ans;
	return 0;
}