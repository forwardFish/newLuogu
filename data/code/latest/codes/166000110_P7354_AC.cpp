#include<bits/stdc++.h>
using namespace std;
int main()
{
	int t,m,n,x,y,ans=0;
	scanf("%d",&t);
	while(t--)
	{
		cin>>m>>n>>x>>y;
		if((x==1 && y==1) || (x==m && y==n) || (x==1 && y==n) || (x==m && y==1))
		{
			cout<<"2"<<endl;
		}
		else if(x==1 || x==m || y==1 || y==n) 
		{
			cout<<"3"<<endl;
		}
		else 
		{
			cout<<"4"<<endl;
		}
	}
	return 0;
}