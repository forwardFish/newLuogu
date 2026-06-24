#include<bits/stdc++.h>
using namespace std;
struct node
{
	string a;
	int b;
}nodes[10000];
int cmp(node x,node y)
{
	return x.b>y.b;
}
int main()
{
	int n;
	cin>>n;
	for(int i=0;i<n;i++)
	{
		cin>>nodes[i].b;
		cin>>nodes[i].a;
	}
	sort(nodes,nodes+n,cmp);
	cout<<nodes[0].a;
	return 0; 
}