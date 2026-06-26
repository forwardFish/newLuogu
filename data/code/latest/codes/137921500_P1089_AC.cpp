#include<iostream>
using namespace std;
int a,b,c,f=1,m;
int main ()
{
    for(int i=1;i<=12;i++)
    {
        a+=300;  
        cin>>b;     
        a-=b;
        if(a<0)      
        {     
            f=0;      
            m=i;    
            break;           
        }
        c+=a/100;    
        a%=100;              
    }    
    if(f==1)     
    {
        a+=c*120;
        cout<<a;
    }            
    else
    {
        cout<<-m;
    }    
    return 0;
}