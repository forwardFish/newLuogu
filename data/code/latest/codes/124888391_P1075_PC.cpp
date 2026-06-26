#include<bits/stdc++.h>
using namespace std;
int main()
{
	int a;
	cin>>a;
	for(int i=a-1;i>=sqrt(a);i--)
	{
		if(a%i==0)
		{
			cout<<i<<endl;
			break; 
		}
	}	
	return 0;
}