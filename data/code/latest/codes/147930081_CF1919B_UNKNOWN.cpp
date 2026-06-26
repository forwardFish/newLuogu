#include<bits/stdc++.h>
using namespace std;
int main()
{
	char s[5005];
	int t;
	cin>>t;
	for(int i=0;i<t;i++)
	{
		int n;
		cin>>n>>s;
		int a=0,b=0;
		for(int i=0;i<n;i++)
		{
			if(s[i]=='+')
			{
				a++;
			}
			else
			{
				b++;
			}
		}
		cout<<n-min(a,b)*2<<endl;
	}	
}