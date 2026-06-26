#include<iostream>
#include<queue>
#include<algorithm>
using namespace std;
queue <int> q;
int main()
{
	int n,ans=0,c;
	cin>>n;
	int a[n+1]={0};
	for(int i=1;i<=n;i++) cin>>a[i];
	sort(a+1,a+n+1);
	for(int i=1;i<=n;i++) q.push(a[i]);
	ans+=(a[n]*6+n+a[n]*4);
	ans+=(unique(a+1,a+n+1)-a-1)*5;
	cout<<ans<<endl;
	return 0;
}