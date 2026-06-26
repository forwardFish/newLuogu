#include<iostream>
using namespace std;
int main()
{
	int a;
	cin>>a;
	for(int i=a-1;i>=2;i--)
	{
		if(a%i==0)
		{
			cout<<i<<endl;
			break; 
		}
	}	
	return 0;
}