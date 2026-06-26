#include<bits/stdc++.h>
using namespace std;
int main()
{
    int n,num,sum;
    char t[40000],s[200];
    scanf("%s",s);
    n=slen(s);
    strcat(t,s);
    for(int i=2;i<=n;i++)
    {
        scanf("%s",s);
        strcat(t,s);
    }
    printf("%d ",n);
    for(int i=0,sum=0,num='0';i<=strlen(t);i++)
    {
        if(num==t[i])
            sum++;
        else
        {
            num=t[i];
            printf("%d ",sum);
            sum=1;
        }
}	
    return 0;
}