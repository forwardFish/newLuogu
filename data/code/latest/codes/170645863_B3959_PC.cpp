#include<bits/stdc++.h> 
using namespace std; 

int main() 
{
    int n;
    cin>>n;
    int arr[n];
    for(int i=1;i<=n;i++)
    {
        cin>>arr[i];
    }
    sort(arr+1,arr+n+1);
    int l=1,r=1;
    int ans=1;
    while(l<=n)
    {
        if(arr[l]>r)
        {
            ans++;
            r++;
        }
        l++;
    }
    cout<<ans<<endl;
    return 0;
}