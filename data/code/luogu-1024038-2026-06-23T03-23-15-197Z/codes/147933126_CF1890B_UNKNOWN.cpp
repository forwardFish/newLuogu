#include <bits/stdc++.h>
using namespace std;
bool z()
{
    int n,m;
    string s,t;
    cin>>n>>m>>s>>t;
    int A[2]={0,0};
    if (t[0]=='0'&&t[m-1]=='0')
    {
    	 A[1]--;
	}
    if (t[0] == '1' && t[m-1]=='1')
    {
    	 A[0]--;
	}
    for (int i=0;i<m-1;i++)
	{
        int j=i+1;
        if (t[i] == t[j]) A[t[i]^48]++;
    }
    int cnt[2]={0,0};
    for (int i = 0; i < n-1; i++)
	{
        int j = i+1;
        if (s[i] == s[j])
        {
        	cnt[s[i]^48]++;
		}
    }
    
    if (cnt[0] && cnt[1])
    {
    	return A[0]<0&&A[1]<0;
	}
    if (cnt[0])
    {
    	return A[0]<0&&A[1]==0;
	}
    if (cnt[1])
    {
    	return A[1]<0&&A[0]==0;
	}
    return true;
}

int main() {
    int t;
    cin>>t;
    while(t--)
    {
    	if(z()==true)
    	{
    		cout<<"Yes"<<endl;
		}
		else
		{
			cout<<"No"<<endl;
		}
	}
    return 0;
}
