#include <bits/stdc++.h>
using namespace std;

struct node{
	long long a,b;
}a[500005];
long long dp[5000005];
bool cmp(node x,node y){
	return x.b<y.b;
}
int main(){
//	freopen(".in","r",stdin);
//	freopen(".out","w",stdout);
	int n;
	cin>>n;
	for(int i=1;i<=n;i++) cin>>a[i].a;
	for(int i=1;i<=n;i++) cin>>a[i].b;
	sort(a+1,a+1+n,cmp);
	long long rt=0,ans=0;
	for(int i=1;i<=n;i++){
		for(int j=min(rt,a[i].b);j>=0;j--){
			dp[j+a[i].b]=max(dp[j+a[i].b],dp[j]+a[i].a*(a[i].b-1)); 
		}
		rt+=a[i].b;
	}
	for(int i=1;i<=5000000;i++) ans=max(ans,dp[i]);
	for(int i=1;i<=n;i++) ans+=a[i].a;
	cout<<ans<<endl;
	return 0;
}