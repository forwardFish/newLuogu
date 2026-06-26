#include <bits/stdc++.h>
using namespace std;int a,b,x,y;int main(){cin>>a>>b>>x>>y;cout<<min(abs(x-a)+abs(y-b),min(abs(b-a),abs(x-b)+abs(y-a)));return 0;}