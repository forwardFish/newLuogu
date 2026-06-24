#include<bits/stdc++.h>
using namespace std;
const int mx=1e5+10;
int n,m;
struct node{
    int l,r;     
	int d;   
}a[mx]={0};
void add(int i,int k,int f)  
{
    if(f==1)   
    {
        a[k].r=a[i].r;
        a[k].l=i; 
        a[i].r=k;
        a[a[k].r].l=k;
    }
    else
    {
        a[k].r=i;
        a[k].l=a[i].l;
        a[i].l=k;
        a[a[k].l].r=k;
    }
}
int main()
{
    int x,k,f;
    cin>>n;
    a[0].r=0,a[0].l=0;
    add(0,1,1);
    for(int i=2;i<=n;i++)
    {
        cin>>x>>f;
        add(x,i,f);
    }
    cin>>m;
    while(m--)
    {
        cin>>x;
        a[x].d=1;
    }
    for(int i=a[0].r;i;i=a[i].r)
    {
        if(a[i].d==0)
          cout<<i<<" ";
    }
    return 0;
}