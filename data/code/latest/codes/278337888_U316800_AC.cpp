#include<bits/stdc++.h>
#define int long long
#define endl "\n"
using namespace std;signed main(){ios::sync_with_stdio(0);cin.tie(0);cout.tie(0);int t;cin>>t;while(t--){int l,r;cin>>l>>r;int sum=((l+r)%9)*((r-l+1)%9);if(sum%9==0){cout<<"Y"<<endl;}else{cout<<"N"<<endl;}}return 0;}
