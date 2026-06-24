#include<bits/stdc++.h>
using namespace std;
int main()
{
	int a;
	cin>>a;
	long long b[a];
	b[0]=1;
	b[1]=1;
	for(int i=2;i<a;i++)
	{
		b[i]=b[i-1]+b[i-2];
	}
	printf("%0.2lf",b[a-1]*1.0);
}