#include<bits/stdc++.h>
using namespace std;
const int maxn=1e5+10;
int arr[maxn],n;
int dp1[maxn],dp2[maxn];
void input(){
    while(cin>>arr[++n]);
    n--;
}
void print(){
    int len1=1;
    int a=0;
    dp1[len1]=arr[1];
    for(int i=2;i<=n;i++){
        if(arr[i]<=dp1[len1]){
            dp1[++len1]=arr[i];
        }else{
            int p=upper_bound(dp1+1,dp1+1+len1,arr[i],greater<int>())-dp1;
            dp1[p]=arr[i];
        }
    }
    cout<<len1<<endl;
    int len2=1;
    dp2[len2]=arr[1];
    for(int i=2;i<=n;i++){
        if(arr[i]>dp2[len2]){
            dp2[++len2]=arr[i];
        }else{
            int p=lower_bound(dp2+1,dp2+1+len2,arr[i])-dp2;
            dp2[p]=arr[i];
        }
    }
    cout<<len2<<endl;
}
int main(){
    input();
    print();
    return 0;
}