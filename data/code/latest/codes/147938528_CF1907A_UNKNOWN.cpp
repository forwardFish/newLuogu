#include<bits/stdc++.h>
using namespace std;
int main()
{
	char b[8]={'a','b','c','d','e','f','g','h'};
	int t;
	cin>>t;
	while(t--)
	{
		string c;
		cin>>c;
		for(int i=1;i<=8;i++)
		{
			if(c[1]-'0'!=i)
			{
				cout<<c[0]<<i<<endl;
			}
		}
		for(int i=0;i<8;i++)
		{
			if(c[0]!=b[i])
			{
				cout<<b[i]<<c[1]<<endl;
			}
		}
	}
	return 0;
}