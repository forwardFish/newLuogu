#include<bits/stdc++.h>
using namespace std;
bool a(int b[][100],int c,int d,int e,int f)
{
    int g[4][2]={{1,0},{0,1},{1,1},{1,-1}};
    for(int h=0;h<4;++h)
    {
        int i=1;
        for(int j=1;j<e;++j)
        {
            int k=c+g[h][0]*j;
            int l=d+g[h][1]*j;
            if(k>=0 && k<f && l>=0 && l<f && b[k][l]==b[c][d])
            {
                i=i+1;
            }
            else
            {
                break;
            }
        }
        for(int j=1;j<e;++j)
        {
            int k=c-g[h][0]*j;
            int l=d-g[h][1]*j;
            if(k>=0 && k<f && l>=0 && l<f && b[k][l]==b[c][d])
            {
                i=i+1;
            }
            else
            {
                break;
            }
        }
        if(i>=e)
        {
            return true;
        }
    }
    return false;
}

int main()
{
    int m;
    cin>>m;
    while(m>0)
    {
        int n,o,p;
        cin>>n>>o>>p;
        int q[100][100]={0};
        int t=0,u=0;
        for(int v=1;v<=o;++v)
        {
            int w,x;
            cin>>w>>x;
            w=w-1;
            x=x-1;
            if(v%2==1)
            {
                q[w][x]=1;
            }
            else
            {
                q[w][x]=2;
            }
            if(a(q,w,x,p,n))
            {
                t=q[w][x];
                u=v;
                break;
            }
        }
        if(t>0)
        {
            if(t==1)
            {
                cout<<"Alice"<<" ";
            }
            else
            {
                cout<<"Bob"<<" ";
            }
            cout<<u<<endl;
        }
        else
        {
            cout<<"draw"<<endl;
        }
        m=m-1;
    }
    return 0;
}
