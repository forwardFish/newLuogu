#include<bits/stdc++.h>
using namespace std;
#define mid (l+r)/2
#define ll long long
#define For(i,j,k) for(int i=(int)(j);i<=(int)(k);i++)
#define Rep(i,j,k) for(int i=(int)(j);i>=(int)(k);i--)
inline ll read(){
	ll x=0;char ch=getchar();bool f=0;
	for(;!isdigit(ch);ch=getchar()) if(ch=='-') f=1;
	for(;isdigit(ch);ch=getchar()) x=x*10+ch-'0';
	return f?-x:x;
}
void write(ll x){
	if(x<0) putchar('-'),x=-x;
	if(x>=10) write(x/10);putchar(x%10+'0');
}
void writeln(ll x){write(x);puts("");}
void writep(ll x){write(x);putchar(' ');}

int n,cnt,ans,sum[13];
char a[103];

int main()
{
	while (cin>>a[++n]);
	int st=1;
	for (int i=1;i<=10;i++){
		int rest=10,flag=1;
		for (int j=st;j<=st+2;j++){
			if (j>n){
				sum[i]=-1;
				break;
			}
			if (rest==0) rest=10,flag=0;
			if (j==st+2 && flag) break;
			if (a[j]=='/') sum[i]+=rest,rest=0;
			else if (a[j]>='0' && a[j]<='9') sum[i]+=a[j]-'0',rest-=a[j]-'0';
		}
		if (sum[i]==-1) break; 
		if (a[st]=='/') st++;
		else st+=2; 
		writep(sum[i]);
	}
	puts("");
	for (int i=1;i<=10;i++){
		if (sum[i]==-1) break;
		ans+=sum[i];
		writep(ans);
	}
    return 0;
}