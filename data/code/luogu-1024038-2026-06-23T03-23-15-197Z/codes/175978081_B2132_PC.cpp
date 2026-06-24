#include<bits/stdc++.h>
using namespace std;
bool pd(int x)
{
	if(x==1) return 0;
	for(int i=2;i<=sqrt(x);i++)
	{
		if(x%i==0)
		{
			return 0;
		}
	}
	return 1;
}
int main()
{
	int n;
	cin>>n; 
	for(int i=2;i<=n;i++)
	{
		if(pd(i)==1 && pd(i+2)==1)
		{
			cout<<i<<" "<<i+2<<endl;
		}
		
	}
	return 0;
} 