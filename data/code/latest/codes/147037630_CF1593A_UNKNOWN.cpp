#include<bits/stdc++.h>
using namespace std;
int main()
{
    int t;
    cin>>t;
    for(int i=0;i<t;i++)
    {
        int a,b,c;
        cin>>a>>b>>c;
        cout<<max(0,max(b,c)-a+1)<<" "<<max(0,max(a,c)-b+1)<<" "<<max(0,max(a,b)-c+1)<<endl;
    }
    return 0;
}
