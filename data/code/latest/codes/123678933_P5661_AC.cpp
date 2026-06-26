#include <bits/stdc++.h>
using namespace std;
const int maxn = 100010;
int n,type[maxn],price[maxn],t[maxn],tot;            
int main(){
    cin>>n;
    for (int i=1;i<=n;i++)cin>>type[i]>>price[i]>>t[i];
    for (int i=1;i<=n;i++){
        if (type[i]==0)tot+=price[i];
        else {
            bool flag=false;
            for (int j=max(1,i-45);j<i;j++) {
                if (type[j]==0&&t[i]-t[j]<=45&&price[j]>=price[i]){
                    type[j]=1;
                    flag=true;
                    break;
                }
            }
            if(!flag)tot+=price[i];
        }
    }
    cout<<tot<<endl;
    return 0;
}
