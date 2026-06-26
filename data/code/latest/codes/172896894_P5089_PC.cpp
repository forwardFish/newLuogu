#include<bits/stdc++.h>
using namespace std;
int main()
{
	int n,m,k;
	cin>>n>>m>>k;
	cout<<max(n+m-k-1,0);
	return 0;
}