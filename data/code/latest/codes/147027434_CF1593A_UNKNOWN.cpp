#include<bits/stdc++.h>
using namespace std;
int main()
{
	int t;
	int a,b,c;
	cin>>t;
	int max1=0;
	for(int i=0;i<t;i++)
	{
		cin>>a>>b>>c;
		max1=max(a,max(b,c));
		if(a==max1 && b<a && c<a)
		{
			cout<<0<<" ";
		}
		else if(a==max1 && b==max1 || c==max1)
		{
			cout<<1<<" ";
		}
		else
		{
			cout<<(max1-a+1)<<" ";
		}
		if(b==max1 && c<b && a<b)
		{
			cout<<0<<" ";
		}
		else if(b==max1 && a==max1 || c==max1)
		{
			cout<<1<<" ";
		}
		else
		{
			cout<<(max1-b+1)<<" ";
		}
		if(c==max1 && b<c && a<c)
		{
			cout<<0<<" ";
		}
		else if(c==max1 && a==max1 || b==max1)
		{
			cout<<1<<" ";
		}
		else
		{
			cout<<(max1-c+1)<<" ";
		}
		cout<<endl;
	}
}