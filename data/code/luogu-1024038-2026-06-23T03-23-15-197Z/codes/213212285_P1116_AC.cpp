#include<bits/stdc++.h>
using namespace std;
const int maxn=1e4+5;
int a[maxn];
int main()
{
	int n;
	cin>>n;
	int ans;
	ans=0;
	for(int i=1;i<=n;i++)
		cin>>a[i];
	for(int i=1;i<=n;i++)
		for(int j=1;j<=i;j++)
			if(a[i]<a[j])
				ans++;
	cout<<ans;
}