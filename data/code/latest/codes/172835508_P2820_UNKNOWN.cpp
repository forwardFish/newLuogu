#include<bits/stdc++.h>
#include<time.h>
#include <stdlib.h>
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
	default_random_engine e;
	cout<<e();
	
	return 0;
 }
 