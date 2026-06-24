#include<bits/stdc++.h>
using namespace std;
const int N=2e5+5;
int a[N];
int main()
{
    int t;
    cin>>t;
    while(t--)
    {
        int n;
        cin>>n;
        for(int i=0;i<n;i++) cin>>a[i];
        int l=0,r=n-1,maxx=n,minn=1;
        while(l<r)
        {   
            if(a[l]==maxx)
            {
                l++;
                maxx--;
            }
            else if(a[l]==minn)
            {
                l++;
                minn++;
            }
            else if(a[r]==maxx)
            {
                r--;
                maxx--;
            }
            else if(a[r]==minn)
            {
                r--;
                minn++;
            }
            else
            {
            	break;
			}
        } 
        if(l>=r) cout<<-1<<endl;
        else cout<<l+1<<" "<<r+1<<endl;
    }
    return 0;
}