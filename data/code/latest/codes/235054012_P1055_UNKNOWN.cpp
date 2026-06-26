#include<bits/stdc++.h>
using namespace std;
int main(){
    char a[15],c;
    gets(a);
    int n=0,b=1;
    for(int i=0;i<12;i++)
	{
        if(a[i]=='-') continue;
        n+=(a[i]-'0')*b;
        b++;    
    }
    n%=11;
    if(n==10)c='X';
    else c=n+'0';
    if(c==a[12])cout<<"Right";
    else
    {
        a[12]=c;
        cout<<a;
    }
    return 0;
}