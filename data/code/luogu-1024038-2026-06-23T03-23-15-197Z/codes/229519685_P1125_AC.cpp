#include<bits/stdc++.h>
using namespace std;
int a[26];
int main(){
    int le=0,xunhuan=0,maxn=-500,minn=9999;
    string s;
    cin>>s;
    le=s.size();
    for(int i=0;i<=le-1;i++){
        xunhuan=s[i];
        a[xunhuan-97]++;
    }
    int zhishu[25]={2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97};
    for(int i=0;i<=25;i++){
        if(a[i]<minn&&a[i]!=0)minn=a[i];
    }
    for(int i=0;i<=25;i++){
        if(a[i]>maxn)maxn=a[i];
    }
    int cha=maxn-minn;
    for(int i=0;i<=24;i++){
        if(cha==zhishu[i]){
            cout<<"Lucky Word"<<endl;
            cout<<cha;
            return 0;
        }
    }
    cout<<"No Answer"<<endl;
    cout<<"0";
    return 0;
} 