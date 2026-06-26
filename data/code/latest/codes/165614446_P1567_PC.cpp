#include<bits/stdc++.h>
using namespace std;        
int main()
{
    int n,s[10000005],ans=0,max=-INT_MAX; 
    cin>>n;                              
    for(int i=1;i<=n;i++)    
	{
		cin>>s[i];
	}           
    for(int i=1;i<=n;i++)                
    {                               
        if(s[i+1]-s[i]==1)
		{
			ans++; 	
		}    
        else 
		{
			ans=0;	
		}          
        if(ans>max)
		{
			max=ans;   	
		}            
	}
	max++;
    cout<<max;                                
}