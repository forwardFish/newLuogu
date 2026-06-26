#include<bits/stdc++.h>
using namespace std;
int main()
{
	int a,b;
	cin>>a>>b;
	int c[a];
	for(int i=0;i<a;i++)
	{
		cin>>c[i];
	}
	sort(c,c+a);
	a=unique(c,c+a)-c;
	if(b>a)
	{
		cout<<"NO RESULT";
	}
	else
	{
		cout<<c[b-1];
	}
	return 0;
}