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
	stable_sort(x,x+a,cmp);
	cout<<x[0].a<<" "<<x[0].b<<" "<<x[0].c<<" "<<x[0].d;
	return 0;
}