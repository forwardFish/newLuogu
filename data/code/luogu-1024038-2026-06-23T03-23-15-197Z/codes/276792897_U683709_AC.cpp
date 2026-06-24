#include<bits/stdc++.h>
#define int long long 
#define endl "\n"
using namespace std;const int maxn=1e6+5;int a[maxn],l;signed main(){;ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);int n;cin>>n;int maxx=-1;if(n==1){	cout<<1<<" "<<1;return 0;}if(n==2){cout<<2<<" "<<1;return 0;}for(int i=2;i*i<=n;i++){if(n%i==0){maxx=max(maxx,i);}}cout<<n/maxx<<" "<<maxx;return 0;} 

 
 
 
 