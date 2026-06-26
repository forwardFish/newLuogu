#include<bits/stdc++.h>
using namespace std;
int a,b;
string c;
int main()
{
	cin>>c;
	for(int i=0;i<c.size();i++)
	{	
		if(c[i]==')')
		{
			 b++;
		 }
		if(b>a)
		{
			cout<<"NO";
			return 0;
		} 
		if(c[i]=='(') 
		{
			a++;
		}
	}
	if(a==b)
	{
		cout<<"YES";
	}
	else 
	{
	 	cout<<"NO";		
	}	
	return 0;
}