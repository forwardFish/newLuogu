#include<bits/stdc++.h>
using namespace std;
int n,k;
int a[305],ans;
bool cmp(int a,int b)
{
	return a>b;
}
int main(){
	cin>>n>>k;
	for(int i=1;i<=k;i++)
	{
		cin>>a[i];	
	}
	sort(a+1,a+1+k,cmp);
	int r=n,l=1;
	for(int i=1;i<=k && l<=r;i++)
	{
		ans+=(r-l)*a[i];
		r--,l++;
	}
	cout<<ans<<endl;
	return 0;
}