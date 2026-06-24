#include<bits/stdc++.h>
#define int long long 
#define endl "\n" 
using namespace std;const int maxn=5e5+5;int a[maxn];signed main(){ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);int n;cin>>n;for(int i=1;i<=n;i++) cin>>a[i];	int ans=-1;for(int i=1;i<n;i++){ans=max(ans,abs(a[i]-a[i+1]));}cout<<ans;return 0;} 