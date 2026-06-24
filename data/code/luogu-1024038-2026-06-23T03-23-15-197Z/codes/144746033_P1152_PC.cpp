#include<bits/stdc++.h>
using namespace std; 
int main()
{
	int a;
	cin>>a;
	int b[a],c[a-1];
	for(int i=0;i<a;i++)
	{
		cin>>b[i];
	}
	for(int i=0;i<a-1;i++)
	{
		c[i]=abs(b[i]-b[i+1]);
	}
	int s=0;
	sort(c,c+a-1);
	for(int i=1;i<=a-1;i++)
	{
		if(c[i]=i)
		{
			s++;
		}
	}
	if(s==a-1)
	{
		cout<<"Jolly";
	}
	else
	{
		cout<<"Not jolly"; 
	}
	return 0;
}