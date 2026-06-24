#include<bits/stdc++.h>
using namespace std;
const int maxn=1e5+5;
int a[maxn];
int main()
{
	int n;
	cin>>n;
	for(int i=1;i<=n;i++) cin>>a[i];
	sort(a+1,a+n+1);
	int j=1;
	for(int i=1;i<=n;i++)
	{
		if(a[j]>=a[i]) continue;
		j++;
	}
	cout<<n-j+1;
	return 0;
}
