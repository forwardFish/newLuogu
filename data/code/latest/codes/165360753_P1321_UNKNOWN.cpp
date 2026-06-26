#include<bits/stdc++.h>    
using namespace std;
int main()
{
	int boy=0,girl=0,len=0;   
	string s=''; 
    cin>>s;    
    len=s.size();    
    for(int i=0; i<len-2; i++)
    {
    	if(s[i]=='b' || s[i+1]=='o' || s[i+2]=='y')
		{
			boy++;
		}
	}
    for(int i=0; i<len-3; i++) 
    {
    	if(s[i]=='g' || s[i+1]=='i' || s[i+2]=='r' || s[i+3]=='l')
		{
			girl++;
		}
	}
    cout<<boy<<endl<<girl;
    return 0;
}