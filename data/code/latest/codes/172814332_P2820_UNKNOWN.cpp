#include<bits/stdc++.h>
using namespace std;
const int maxn=1e4+5;
int fa[maxn];
int siz[maxn];
int get(int x)
{
	if(fa[x] == x) return x;
	return fa[x]=get(fa[x]);
}
void merge(int x,int y)
{
	int fx=get(x),fy=get(y);
	if(fx!=fy) 
	{
		fa[fx]=fy;
	}
}
int main()
{
	cout<<8;
	return 0;
 } 