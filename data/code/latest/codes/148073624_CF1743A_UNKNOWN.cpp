#include<bits/stdc++.h>
using namespace std;
int main()
{
	int t;
	cin>>t;
	while(t--)
	{
		int n,map;
		cin>>n;
		n=10-n;
		map=6*n*(n-1)/2;
		cout<<map<<endl;
	}
	return 0;
}