#include<bits/stdc++.h>
using namespace std;
double a[114514];
double b[114514];
int n;
double c(double x){
    double mn=INT_MAX,mx=-INT_MAX;
    for(int i=1;i<=n;i++){
        mn=fmin(mn,a[i]+b[i]*x);
        mx=fmax(mx,a[i]+b[i]*x);
    }
    return mx-mn;
}
void f(){
    if(n==0){
        return;
    }
    for(int i=1;i<=n;i++){
        cin>>a[i]>>b[i];
    }
    double l=0,r=2000000;
    while(r-l>3e-9){
        double m1=(l+r)/2.0-1e-9;
        double m2=m1+2e-9;
        if(c(m1)>c(m2)){
            l=m2;
        }
        else{
            r=m1;
        }
    }
    printf("%.2lf\n",c((l+r)/2));
}
int main(){
    while(cin>>n){
        f();
    }
}
