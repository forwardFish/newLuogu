#include<bits/stdc++.h>
using namespace std;
int main()
{
	string s;
	cin>>s;
	int q;
	cin>>q;
	while(q--)
	{
		 int l1,r1,l2,r2;
		 cin>>l1>>r1>>l2>>r2;
		 
		 string a=s.substr(l1-1,r1-l1+1);
		 string b=s.substr(l2-1,r2-l2+1);
		 if(a==b)
		 {
		 	cout<<"Yes\n";
		  } 
		  else
		  {
		  	cout<<"No\n";
		  }
	}
	return 0;
}
