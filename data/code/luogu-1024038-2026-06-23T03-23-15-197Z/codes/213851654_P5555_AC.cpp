#include<bits/stdc++.h>
const int N=3e5+5;
char s[N],ss[N];
int mx=0,tot=0,n,m;
struct pam{
    int len[N],fail[N],ch[N][26],tot,lst,num[N];
    char s[N];
    void init(char*ss){
        tot=lst=1;
        len[1]=-1,len[0]=0,fail[0]=1;
        for(int i=1;ss[i];++i)s[i]=ss[i];
    }
    int insert(char cr,int ed){
        int c=cr-'a';
        int p=lst;
        while(s[ed]!=s[ed-len[p]-1])
        p=fail[p];
        if(!ch[p][c]){
            int np=++tot;
            len[np]=len[p]+2;
            int q;
            for(q=fail[p];s[ed]!=s[ed-len[q]-1];q=fail[q]);
            fail[np]=ch[q][c];
            num[np]=num[fail[np]]+1;
            ch[p][c]=np;
        }
        lst=ch[p][c];
        return num[lst];
    }
}p1,p2;
void dfs(int nl,int nr){
    if(mx<p1.len[nl])mx=p1.len[nl],tot=1;else
    if(mx==p1.len[nl])++tot;
    for(int i=0;i<26;++i)
    if(p1.ch[nl][i]&&p2.ch[nr][i])dfs(p1.ch[nl][i],p2.ch[nr][i]);
}
int main(){
    scanf("%d%d",&n,&m);
    scanf("%s%s",s+1,ss+1);
    p1.init(s),p2.init(ss);
    for(int i=1;s[i];++i)
    p1.insert(s[i],i);
    for(int i=1;ss[i];++i)
    p2.insert(ss[i],i);
    dfs(0,0);
    dfs(1,1);
    printf("%d %d\n",mx,tot);
    return 0;
}
