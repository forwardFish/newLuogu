#include <bits/stdc++.h>
using namespace std;
#define ll long long 
string s;
int cnt[30];
ll ans=0;
int main()
{    
    cin>>s;
    s=' '+s;
    for(int i=1;i<s.size();i++)
    {
        ans+=(i-1-cnt[s[i]-'a']);
        cnt[s[i]-'a']++;
    }
    for(int i=0;i<=25;i++)
    {
        if(cnt[i]>=2)
        {
            ans++;
            break;
        }
    }
    cout<<ans<<endl;
    return 0;
}