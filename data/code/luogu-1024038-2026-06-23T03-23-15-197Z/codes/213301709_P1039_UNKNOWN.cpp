#include<bits/stdc++.h>
using namespace std;
map<string,int> per;
string nm[25];
map<string,int> day;
struct sta
{
    int u;
    bool to;
    bool is;
    sta(int u,bool to,bool is)
    {
        this->u=u;
        this->to=to;
        this->is=is;
    }
    sta(){}
};
vector<sta> v[25];
char asdfghjkl[1000];
int main()
{
    int n,m,p;
    cin>>n>>m>>p;
    string s;
    for(int i=1;i<=n;++i)
    {
        cin>>s;
        per[s]=i;
        nm[i]=s;
    }
    per["Today"]=n+1;
    day["Monday."]=1;
    day["Tuesday."]=2;
    day["Wednesday."]=3;
    day["Thursday."]=4;
    day["Friday."]=5;
    day["Saturday."]=6;
    day["Sunday."]=7;
    for(int i=1;i<=p;++i)
    {
        cin>>s;
        s=s.substr(0,s.size()-1);
        int t=per[s];
        cin>>s;
        int u=per[s];
        if(u<=n)
        {
            cin>>s;
            if((u&&s!="is")||(!u&&s!="am"))
            {
                gets(asdfghjkl);
                continue;
            }
            if(!u)
                u=t;
            cin>>s;
            if(s=="not")
            {
                cin>>s;
                if(s=="guilty.")
                    v[t].push_back(sta(u,0,0));
            }
            else if(s=="guilty.")
                v[t].push_back(sta(u,0,1));
        }
        else if(u==n+1)
        {
            cin>>s;
            if(s!="is")
                continue;
            cin>>s;
            if(day[s])
                v[t].push_back(sta(day[s],1,1));
        }
        else
            gets(asdfghjkl);
    }
    string ans="";
    for(int i=1;i<=n;++i)
    {
        for(int j=1;j<=7;++j)
        {
            int flag=0,cnt=n,ran=0;
            for(int k=1;!flag&&k<=n;++k)
            {
                vector<sta>::iterator it=v[k].begin();
                if(!v[k].size())
                {
                    ++ran;
                    continue;
                }
                sta tmp=*it;
                bool rea;
                if(tmp.to)
                    rea=(tmp.u==j);
                else
                    rea=((tmp.u==i)^(!tmp.is));
                ++it;
                for(;!flag&&it!=v[k].end();++it)
                {
                    if(it->to)
                    {
                        if(rea!=(it->u==j))
                            flag=1;
                    }
                    else
                    {
                        if(rea==((it->u==i)^it->is))
                            flag=1;
                    }
                }
                cnt-=rea;
            }
            if(!flag&&cnt>=m&&cnt-ran<=m)
            {
                if(ans=="")
                    ans=nm[i];
                else if(ans!=nm[i])
                {
                    cout<<"Cannot Determine"<<endl;
                    return 0;
                }
            }
        }
    }
    if(ans=="")
        cout<<"Impossible"<<endl;
    else
        cout<<ans<<endl;
    return 0;
}