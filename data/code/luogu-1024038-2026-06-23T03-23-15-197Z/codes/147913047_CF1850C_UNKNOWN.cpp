#include<bits/stdc++.h>
using namespace std;
char a[20][20];
int main()
{
	int t;
	cin>>t;
	while(t--)
	{
		for(int i=0;i<8;i++)
		{
			for(int j=0;j<8;j++)
			{
				cin>>a[i][j];
			}
		}
		for(int i=0;i<8;i++)
		{
			for(int j=0;j<8;j++)
			{
				if(a[i][j]!='.')
				{
					cout<<a[i][j];
				}
			}
		}
		cout<<endl;
	}
	return 0;
}