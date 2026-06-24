#include<bits/stdc++.h>
using namespace std;
int t;
string s,ss;
int main()
{
	cin>>t;
	while(t--)
	{
		cin>>s;
		if(s=="yes"||s=="Yes"||s=="yEs"||s=="yeS"||s=="YEs"||s=="YeS"||s=="yES"||s=="YES")
		{
			cout<<"YES"<<endl;
		}
		else 
		{
			cout<<"No"<<endl;
		}
	}
	return 0;
}
 