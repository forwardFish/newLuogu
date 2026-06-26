#include<bits/stdc++.h>
using namespace std;
char s1[100005];
char s2[100005];
struct int_unlimit
{
	int a[100005];
	int len;
	
	//清空int数组
	int_unlimit ()
	{
		memset(a,0,sizeof(a));
	}
	
	//字符数组转int数组
	int_unlimit (char* s)
	{
		memset(a,0,sizeof(a));
		len = strlen(s);
		for(int i=len-1;i>=0;i--)
		{
			a[len-i-1] = s[i]-'0';
		}
	}
	
	// 高精度加法
	int_unlimit operator +(int_unlimit &b)
	{
		int_unlimit ans;
		ans.len = max(len,b.len);
		int u = 0;
		for(int i=0;i<ans.len;i++)
		{
			ans.a[i] = a[i]+b.a[i]+u;
			u = ans.a[i]/10;
			ans.a[i]%=10;
		}
		if(u != 0)
		{
			ans.a[ans.len] = 1;
			ans.len++;
		}
		return ans;
	}
	
	// 高精度减法
	int_unlimit operator -(int_unlimit &b)
	{
		int_unlimit ans;
		ans.len = max(len,b.len);
		int d = 0;
		for(int i=0;i<ans.len;i++)
		{
			ans.a[i] = a[i]-b.a[i]-d;
			d = 0;
			if(ans.a[i] < 0) d = 1;
			ans.a[i]+=10;
			ans.a[i]%=10;
		}
		if(d != 0)
		{
			ans.a[ans.len-1]-=1;
			ans.len--;
		}
		while(ans.a[ans.len] == 0&&ans.len > 1) ;
		return ans;
	}
	
	// 高精度乘法
	int_unlimit operator *(int_unlimit &b)
	{
		int_unlimit ans;
		ans.len = len+b.len;
		for(int i=0;i<=len;i++)
		{
			int u = 0;
			for(int j=0;j<=b.len;j++)
			{
				int o = i+j;
				ans.a[o] = ans.a[o]+a[i]*b.a[j]+u;
				u = ans.a[o]/10;
				ans.a[o]%=10;
			}
		}
//		while(ans.a[ans.len] == 0&&ans.len > 1) ;
		return ans;
	}
		
//	// 高精度除法
//	int_unlimit operator /(int_unlimit &b)
//	{
//		
//	}
	
	// 高精度大于
	bool operator >(int_unlimit &b) 
	{
		if(len > b.len) return true;
		if(len < b.len) return false;
		for(int i=0;i<len;i++)
		{
			if(a[len-i-1] < b.a[len-i-1]) return false;
			if(a[len-i-1] > b.a[len-i-1]) return true;
		}
		return false;
	}
	
	// 高精度小于
	bool operator <(int_unlimit &b)
	{
		if(len > b.len) return false;
		if(len < b.len) return true;
		for(int i=0;i<len;i++)
		{
			if(a[len-i-1] < b.a[len-i-1]) return true;
			if(a[len-i-1] > b.a[len-i-1]) return false;
		}
		return false;
	}
	
	// 高精度等于
	bool operator ==(int_unlimit &b)
	{
		if(len > b.len) return false;
		if(len < b.len) return false;
		for(int i=0;i<len;i++)
		{
			if(a[len-i-1] < b.a[len-i-1]) return false;
			if(a[len-i-1] > b.a[len-i-1]) return false;
		}
		return true;
	}
	
	// 输出数字
	void print()
	{
		bool is_unuse = true;
		for(int i=0;i<len;i++)
		{
			if(a[len-i-1] != 0) is_unuse = false;
			if(is_unuse&&i != len-1) continue;
			printf("%d",a[len-i-1]);
		}
	}
};
int main()
{
	scanf("%s",s1);
	scanf("%s",s2);
	int_unlimit a(s1),b(s2),c = a*b;
	c.print();
	return 0;
}