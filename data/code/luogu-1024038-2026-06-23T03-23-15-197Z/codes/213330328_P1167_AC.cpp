#include<bits/stdc++.h>
using namespace std;
int n,ti[5001];
int day[13]={0,31,28,31,30,31,30,31,31,30,31,31,30};
int a[10],b[10];
long long t;
int ans;
bool panding(int x){
    if(x%100==0){if(x%400==0)return 1;}
    else{if(x%4==0)return 1;}
    return 0;
}
int main(){
    cin>>n;
    for(int i=1;i<=n;i++)
       cin>>ti[i];
    sort(ti+1,ti+n+1);
    scanf("%d-%d-%d-%d:%d",&a[1],&a[2],&a[3],&a[4],&a[5]);
    scanf("%d-%d-%d-%d:%d",&b[1],&b[2],&b[3],&b[4],&b[5]);
    for(int i=a[1];i<b[1];i++)
       if(panding(i))t-=366;
       else t-=365;
    for(int i=1;i<a[2];i++)t+=day[i];
    for(int i=1;i<b[2];i++)t-=day[i];
    if(panding(a[1])&&a[2]>2)t++;
    if(panding(b[1])&&b[2]>2)t--;
    t+=a[3];
    t-=b[3];
    t*=1440;
    t+=60*a[4]+a[5];
    t-=60*b[4]+b[5];
    t*=-1;
    for(int i=1;i<=n;i++){
        if(t>=ti[i])t-=ti[i],ans++;
        else break;
    }
    cout<<ans;
    return 0;
}