#include<bits/stdc++.h>
#define int long long
#define endl "\n"
using namespace std;
const int maxn=5e2+5;	int n;
int a[maxn][maxn],t[maxn][maxn];
int d[maxn],st[maxn];
int f(int x)
{
	for(int i=1;i<=n;i++)
	{
		for(int j=1;j<=n;j++)
		{
			if(a[i][j]>=x) t[i][j]=t[i-1][j]+1;
			else t[i][j]=0;
		}
	}
	int cnt=0;
	for(int i=1;i<=n;i++)
	{
		int tmp=0;
		t[i][0]=0;
		for(int j=1;j<=n;j++)
		{
			while(t[i][st[tmp]]>t[i][j]) tmp--;
			d[j]=d[st[tmp]]+(j-st[tmp])*t[i][j];
			cnt+=d[j];
			st[++tmp]=j;
		}
	}
	return cnt;
}
signed main()
{
	ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);

	cin>>n;
	for(int i=1;i<=n;i++)
	{
		for(int j=1;j<=n;j++)
		{
			cin>>a[i][j];
		}
	}
	cout<<f(100)-f(101);
	return 0;
 }
