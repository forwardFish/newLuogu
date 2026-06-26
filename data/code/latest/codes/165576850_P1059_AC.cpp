#include<bits/stdc++.h>
using namespace std;
int lt[1100],lt1[1100];
int main()
{
    int n,a=0;

    cin>>n;
    for(int i=1;i<=n;i++)
    {    
        cin>>lt[i];
        lt1[lt[i]]++;
    }
for(int i=1;i<1000;i++)
 if(lt1[i]>0)a++;
cout<<a<<endl;
for(int i=1;i<1000;i++)
if(lt1[i]>0)cout<<i<<" ";
cout<<endl;
        return 0;
}