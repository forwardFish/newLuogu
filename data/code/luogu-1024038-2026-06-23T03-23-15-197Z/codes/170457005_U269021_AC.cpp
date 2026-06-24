#include<bits/stdc++.h>
using namespace std;
const int N=1e5+5;
int a[N],b[N],n,m;
int main()
{
    cin>>n>>m;
    for(int i=1;i<=n;i++) cin>>a[i];
    for(int i=1;i<=m;i++) cin>>b[i];
    int l=1,r=1;
    while(l<=n)
    {
        while(r<=m && a[l]!=b[r]) r++;
        if(r>m)
        {
            cout<<"No"<<endl;
            return 0;
        }
		l++;
		r++;
    }
    cout<<"Yes"<<endl;
    return 0;   
}