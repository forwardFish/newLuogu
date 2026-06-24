#include<bits/stdc++.h>
using namespace std;
int main()
{
	int t;
	cin>>t;
	while(t--)
	{
		int x;
		cin>>x;
		int a,b,c;
		cin>>a>>b>>c;
		if(x==1 && a==0)
		{
			cout<<"NO"<<endl;
		}
		else if(x==2 && b==0)
		{
			cout<<"NO"<<endl;
		}
		else if(x==3 && c==0)
		{
			cout<<"NO"<<endl;
		}
		else if(x==1 && a==0)
		{
			cout<<"NO"<<endl; 
		}
		else if(x==2 && b==0) 
		{
			cout<<"NO"<<endl;
		}
		else if(x==3 && c==0)
		{
			cout<<"NO"<<endl;
		}
		else if(x==1 && a==2 && b==0)
		{
			cout<<"NO"<<endl;
		}
		else if(x==1 && a==3 && c==0)
		{
			cout<<"NO"<<endl;
		}
		else if(x==2 && b==1 && a==0)
		{
			cout<<"NO"<<endl;
		}
		else if(x==2 && b==3 && c==0)
		{
			cout<<"NO"<<endl;
		}
		else if(x==3 && c==1 && a==0)
		{
			cout<<"NO"<<endl;
		}
		else if(x==3 && c==2 && b==0)
		{
			cout<<"NO"<<endl;
		}
		else 
		{
			cout<<"YES"<<endl;
		}
		
	}
	return 0;
 } 