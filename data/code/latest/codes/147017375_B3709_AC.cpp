#include<bits/stdc++.h>
using namespace std;
int a(int n) {
    if (n==0 || n==1)
        return 1;
    else
        return n*a(n-1);
}
int main() {
    int n;
    cin>>n;
    long long b=a(n);
    cout<<2*(b-n)<<" "<<2*(b-2*n)<<" "<<2;
    return 0;
}
