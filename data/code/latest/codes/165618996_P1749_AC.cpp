#include<bits/stdc++.h>
using namespace std;
int main()
{
 	long long a,b;
 	int t;
 	cin>>t;
 	for(int i=0;i<t;i++)
	{
 		cin>>a>>b;
 		if(a>=(b+1)*b/2) 
		{
		 	cout<<"Yes"<<endl;
		}
 		else
		{
		 	cout<<"No"<<endl;	
		}
 	}
	return 0;
}
