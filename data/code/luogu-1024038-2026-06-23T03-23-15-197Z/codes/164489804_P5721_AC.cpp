#include<bits/stdc++.h> 
using namespace std;
int main()
{
	int n,map=0;
	cin>>n;
	for(int i=1;i<=n;i++)
	{
		for(int j=i;j<=n;j++)
		{
			map++;
			if(map<10) 
			{
				cout<<"0";
			}
			cout<<map;
		}
		cout<<endl;
	}
	return 0;
	
} 