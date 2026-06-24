#include <bits/stdc++.h>
using namespace std;
const int N=1000005;
int arr[N],t[N],ans=0;
int main()
{
    int n;
    cin >> n;
    for (int i = 0; i < n; i++)
    {
        cin >> arr[i];
    }
    int l=0,r=0;
    while(r<n)
    {
        t[arr[r]]++;
        while(t[arr[r]]>1)
        {
            t[arr[l]]--;
            l++;
        }
        ans=max(ans,r-l+1);
        r++;
    }
    cout<<ans;
    return 0;
}