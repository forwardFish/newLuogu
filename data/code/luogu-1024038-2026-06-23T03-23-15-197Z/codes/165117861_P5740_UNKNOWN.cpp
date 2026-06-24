#include<bits/stdc++.h>
using namespace std;
struct node
{
	string a;
	int b,c,d,e;
}x[1005];
int cmp(node a,node b)
{
	return a.e>b.e;
}
int main()
{
	int a;
	cin>>a;
	for(int i=0;i<a;i++)
	{
		cin>>x[i].a>>x[i].b>>x[i].c>>x[i].d; 
		x[i].e=x[i].b+x[i].c+x[i].d;
	}
	sort(x,x+a,cmp);
	for(int i=0;i<a;i++)
	{
		cout<<x[i].a<<" "<<x[i].b<<" "<<x[i].c<<" "<<x[i].d;
	}
	return 0;
}