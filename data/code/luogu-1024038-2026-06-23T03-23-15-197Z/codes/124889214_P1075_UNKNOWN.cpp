#include<bits/stdc++.h>
using namespace std;
int main()
{
	long long a;
	cin>>a;
	for(int i=2;i<=a;i--)
	{
		if(a%i==0)
		{
			cout<<n/i<<endl;
			break; 
		}
	}	
	return 0;
}