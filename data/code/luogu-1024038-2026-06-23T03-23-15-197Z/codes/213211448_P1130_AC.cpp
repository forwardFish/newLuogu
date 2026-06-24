#include<bits/stdc++.h>
using namespace std;
const int maxn=2e3+5;
int n,m,a[maxn][maxn],ans=INT_MAX;
int main(){
    cin>>n>>m;
    for (int i=0;i<m;i++)
        {
            for (int j=0;j<n;j++)cin>>a[i][j];
        }
    
    for (int j=n-2;j>=0;j--)
        {
             for (int i=0;i<m;i++)
                 {
                     a[i][j]=min(a[(i+1)%m][j+1],a[i][j+1])+a[i][j];
                 }
        }
   
    for (int i=0;i<m;i++)ans=min(ans,a[i][0]);
    cout<<ans;
    
    return 0;
}