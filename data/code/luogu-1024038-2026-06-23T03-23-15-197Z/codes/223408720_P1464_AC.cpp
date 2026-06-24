#include<bits/stdc++.h>
#define int long long
using namespace std;
const int maxn=25;
int w[maxn][maxn][maxn];
bool vis[maxn][maxn][maxn];
int ww(int a,int b,int c)
{
	if(a<=0 || b<=0 || c<=0) return 1;
	if(a>20 || b>20 || c>20) return ww(20,20,20);
	if(vis[a][b][c]) return w[a][b][c];
	if(a<b && b<c)
	{
		 w[a][b][c]=ww(a,b,c-1)+ww(a,b-1,c-1)-ww(a,b-1,c);
	}
	else
	{
		w[a][b][c]=ww(a-1,b,c)+ww(a-1,b-1,c)+ww(a-1,b,c-1)-ww(a-1,b-1,c-1);
	}
	vis[a][b][c]=1;
	return w[a][b][c];
}

signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int a,b,c;
	while(cin>>a>>b>>c)
	{
		if(a==-1 && b==-1 && c==-1)
		{
			return 0;
		}
		cout<<"w("<<a<<", "<<b<<", "<<c<<") = "<<ww(a,b,c)<<endl;
	}
	
	
	
	return 0;
}



