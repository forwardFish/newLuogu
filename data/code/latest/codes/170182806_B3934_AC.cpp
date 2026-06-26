#include<bits/stdc++.h>
using namespace std;
int main()
{
	int k;
	cin>>k;
	int map=0;
	for(int i=1;i<=9;i++)
	{
		for(int j=0;j<=9;j++)
		{
			for(int z=0;z<=9;z++)
			{
				if((i*10+j)%k==0 && (j*10+z)%k==0 && (i*100+j*10+z)%k==0)
				{
					cout<<i<<j<<z<<endl;
					map++;
				}
			}
		}
	}
	if(map==0)
	{
		cout<<"None!";
	}
	return 0;
 } 