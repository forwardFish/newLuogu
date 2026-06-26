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
    int cha=maxn-minn;//相减
    for(int i=0;i<=24;i++){
        if(cha==zhishu[i]){
            cout<<"Lucky Word"<<endl;
            cout<<cha;//如果是质数直接输出并结束程序
            return 0;
        }
    }
    cout<<"No Answer"<<endl;//如果找完了还没有就不是质数
    cout<<"0";
    return 0;
} 