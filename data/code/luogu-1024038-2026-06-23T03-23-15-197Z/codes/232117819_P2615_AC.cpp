#include<bits/stdc++.h>
using ll=long long;
using lld=unsigned long long;
using namespace std;
//const int mod=1e9+7;
//int a,b,p;
//const int maxn=1e6+5;
//int prime[maxn], tot;
//void solve(int x) 枚举质数
//{
//	for(int i = 2; i * i <= x; i++)
//	{
//		while(x % i == 0)
//		{
//			x /= i;
//			prime[++tot] = i;
//		}
//	}
//	if(x != 1) prime[++tot] = x;
//}
//bool isprime[maxn];
//int prime1[maxn], tot1;
//void solve(int N) {
//	for(int i = 2; i <= N; i++) isprime[i] = 1;
//	isprime[1] = 0;
//	for(int i=2;i <= N;i++)
//	{
//		if(isprime[i]) prime1[++tot1] = i;
//		for(int j = 1; j <= tot1 && i * prime1[j] <= N; j++) {
//			isprime[i * prime1[j]] = 0;
//			if(i % prime1[j] == 0) break; //保证每个合数被它最小的质因数筛去
//		}
//	}
//}
//int gcd(int a, int b)
//{
//	return (a == 0 ? b : gcd(b % a, a));
//}
//int lcm(int a,int b)
//{
//	return a*b/gcd(a,b);
//}
//int poww(int a,int b,int p) { //a^b
//	int ans = 1, base = a % p;
//	while (b)
//	{
//		if (b & 1) ans= ans * base % p;
//		base = base * base % p;
//		b >>= 1;
//	}
//	return ans % p;
//}
//int solve1(int l, int r){ //最大合法解
//	int ans = -1;
//	while(l <= r) {
//		int mid = l + r >> 1;
//		if(check(mid)) ans = mid, l = mid + 1;
//		else r = mid - 1;
//	}
//	return ans;
//}
//int solve2(int l, int r) //最小合法解
//{
//	int ans = -1;
//	while(l <= r) {
//		int mid = l + r >> 1;
//		if(check(mid)) ans = mid, r = mid - 1;
//		else l = mid + 1;
//	}
//	return ans;
//}
//// 高精度加法
//void add(char* a, char* b, char* result) {
//    int len_a = strlen(a);
//    int len_b = strlen(b);
//    int max_len = max(len_a, len_b) + 1;
//    int carry = 0;
//    int index = 0;
//
//    for (int i = 0; i < max_len; ++i) {
//        int digit_a = (i < len_a) ? a[len_a - 1 - i] - '0' : 0;
//        int digit_b = (i < len_b) ? b[len_b - 1 - i] - '0' : 0;
//        int sum = digit_a + digit_b + carry;
//        result[max_len - 1 - index++] = (sum % 10) + '0';
//        carry = sum / 10;
//    }
//    result[max_len] = '\0';
//
//    // 去除前导零
//    if (result[0] == '0') {
//        memmove(result, result + 1, max_len);
//    }
//}
//
//// 高精度减法
//void sub(char* a, char* b, char* result) {
//    int len_a = strlen(a);
//    int len_b = strlen(b);
//    int max_len = len_a;
//    int borrow = 0;
//    int index = 0;
//
//    for (int i = 0; i < max_len; ++i) {
//        int digit_a = a[len_a - 1 - i] - '0';
//        int digit_b = (i < len_b) ? b[len_b - 1 - i] - '0' : 0;
//        int diff = digit_a - digit_b - borrow;
//        if (diff < 0) {
//            diff += 10;
//            borrow = 1;
//        } else {
//            borrow = 0;
//        }
//        result[max_len - 1 - index++] = diff + '0';
//    }
//    result[max_len] = '\0';
//
//    // 去除前导零
//    while (result[0] == '0' && strlen(result) > 1) {
//        memmove(result, result + 1, max_len);
//    }
//}
//// 高精度乘法
//void mul(char* a, char* b, char* result) {
//    int len_a = strlen(a);
//    int len_b = strlen(b);
//    int max_len = len_a + len_b;
//    int* temp = new int[max_len]();
//
//    for (int i = 0; i < len_a; ++i) {
//        for (int j = 0; j < len_b; ++j) {
//            temp[i + j] += (a[len_a - 1 - i] - '0') * (b[len_b - 1 - j] - '0');
//            temp[i + j + 1] += temp[i + j] / 10;
//            temp[i + j] %= 10;
//        }
//    }
//    int index = 0;
//    while (index < max_len && temp[index] == 0) ++index;
//    if (index == max_len) {
//        result[0] = '0';
//        result[1] = '\0';
//    } else {
//        for (int i = index; i < max_len; ++i) {
//            result[i - index] = temp[max_len - 1 - i + index] + '0';
//        }
//        result[max_len - index] = '\0';
//    }
//
//    delete[] temp;
//}
//// 高精度除法
//void div(char* a, int b, char* result, int& remainder)
//{
//    int len_a = strlen(a);
//    remainder = 0;
//    int index = 0;
//
//    for (int i = 0; i < len_a; ++i) {
//        remainder = remainder * 10 + (a[i] - '0');
//        result[index++] = (remainder / b) + '0';
//        remainder %= b;
//    }
//    result[index] = '\0';
//    if (result[0] == '0' && strlen(result) > 1) {
//        memmove(result, result + 1, index);
//    }
//}
//int phi(int x) //欧拉函数
//{
//	int ans=1,num=1;
//	for(int i=2;i*i<=x;i++)
//	{
//		if(!(x%i))
//		{
//			num=i-1,x/=i;
//			while(!(x%i)) num=num*i,x/=i;
//			ans=num*ans;
//		}
//	}
//	if(x!=1) ans=ans*(x-1);
//	return ans;
//}
//int a,mod;
//char b[20000005];
//inline int quickpow(int a,int b)
//{
//	long long ans=1,base=(long long)a;
//	while(b)
//	{
//		if(b&1) ans=ans*base%mod;
//		b>>=1;
//		base=base*base%mod;
//	}
//	return (int)(ans%mod);
//}
//Polya 定理
//#define rep( i, s, t ) for( register int i = s; i <= t; ++ i )
//#define re register
//#define int long long
//int gi() {
//	char cc = getchar() ; int cn = 0, flus = 1 ;
//	while( cc < '0' || cc > '9' ) {  if( cc == '-' ) flus = - flus ; cc = getchar() ; }
//	while( cc >= '0' && cc <= '9' )  cn = cn * 10 + cc - '0', cc = getchar() ;
//	return cn * flus ;
//}
//const int P = 1e9 + 7 ;
//int T, n ;
//int fpow( int x, int k ) {
//	int ans = 1, base = x ;
//	while( k ) {
//		if( k & 1 ) ans = 1ll * ans * base % P ;
//		base = base * base % P, k >>= 1 ;
//	} return ans ;
//}
//int phi( int x ) {
//	int ans = x ;
//	for( re int i = 2; i <= sqrt(x); ++ i ) {
//		if( x % i ) continue ;
//		ans = ans - ans / i ;
//		while( x % i == 0 ) x /= i ;
//	}
//	if( x != 1 ) ans = ans - ans / x ;
//	return ans ;
//}
//void inc( int &x, int y ) {
//	( ( x += y ) >= P ) && ( x -= P ) ;
//}
//signed main()
//{
//	int T = gi() ;
//	while( T-- ) {
//		int n = gi(), cnt = sqrt(n), Ans = 0 ;
//		for( re int i = 1; i <= cnt; ++ i ) {
//			if( n % i ) continue ;
//			int p1 = phi(i), f1 = fpow( n, n / i ) ;
//			f1 = f1 * p1 % P, inc( Ans, f1 ) ;
//			if( i * i != n ) {
//				int p2 = phi( n / i ), f2 = fpow( n, i ) ;
//				f2 = f2 * p2 % P, inc( Ans, f2 ) ;
//			}
//		}
//		cout << Ans * fpow( n, P - 2 ) % P << endl ;
//	}
//	return 0 ;
//}
//Polya 定理
//#include<bits/stdc++.h>
//using namespace std;
//int a[100001],b[100001],ans[100001],f[100001];
//int main()
//{
//	int n;
//	cin>>n;
//	for(int i=1;i<=n;i++)
//	{
//		cin>>a[i];
//		ans[a[i]]=i;
//	}
//	for(int i=1;i<=n;i++)
//	{
//		cin>>b[i];
//		f[i]=INT_MAX;
//	}
//	int cd=0;
//	f[0]=0;
//	for(int i=1;i<=n;i++)
//	{
//		int l=0,r=cd,zj;
//		if(ans[b[i]]>f[cd])
//		{
//			f[++cd]=ans[b[i]];
//		}
//		else
//		{
//			while(l<r)
//			{
//		    	zj=(l+r)/2;
//		    	if(f[zj]>ans[b[i]])
//				{
//					r=zj;
//				}
//				else
//				{
//					 l=zj+1;
//				 }
//			}
//			f[l]=min(ans[b[i]],f[l]);
//     	}
//    }
//    cout<<cd;
//    return 0;
//}最长公共子序列
//const int maxn=5e3+5;
//int a[maxn],dp[maxn];
//void zcs()
//{
//	int n;
//	cin>>n;
//	for(int i=1;i<=n;i++)
//	{
//		cin>>a[i];
//	}
//	int len=1;
//    dp[len]=a[1];
//    for(int i=2;i<=n;i++)
//	{
//        if(a[i]>dp[len])
//		{
//            dp[++len]=a[i];
//        }
//		else
//		{
//            int p=lower_bound(dp+1,dp+1+len,a[i])-dp;
//            dp[p]=a[i];
//        }
//    }
//    cout<<len<<endl;
//}最长上升子序列
//lld = long long
//lf = double
//// 最大公因数
//lld GCD(lld number_1,lld number_2)
//{
//	return number_2?GCD(number_2,number_1%number_2):number_1;
//}
//// 最小公倍数
//lld LCM(lld number_1,lld number_2)
//{
//	return number_1/GCD(number_1,number_2)*number_2;
//}
//// 绝对值
//lf Abs(lf number)
//{
//	return number*(-1+2*(number>0));
//}
//// 快速幂
//lf Power(lf Base,lld Exponential)
//{
//	bool Biger0 = Exponential>0;
//	Exponential = Abs(Exponential);
//	lf Result = 1,Now = Base;
//	while(Exponential)
//	{
//		if(Exponential&1)
//			Result*=Now;
//		Now*=Now;
//		Exponential>>=1;
//	}
//	return (Biger0?(Result):(1/Result));
//}
//// 快速幂取模
//lld Power_mod(lld Base,lld Exponential,lld Mod)
//{
//	if(Exponential<0)
//		return LONG_LONG_MIN;
//	lf Result = 1,Now = Base;
//	while(Exponential)
//	{
//		if(Exponential&1)
//			Result*=Now,
//			Result%=Mod;
//		Exponential>>=1;
//		Now*=Now,Now%=Mod;
//	}
//	return Result%Mod;
//}
//// 平方根
//lf Squ_Root(int m)
//{
//	lf last = m;
//	lf ans = m;
//	ans = (ans + m/ans) / 2;
//	while(Abs(ans - last) > exp)
//	{
//		last = ans;
//		ans = (ans + m/ans) / 2;
//	}
//	return ans;
//}
//// 四舍五入
//lf Round(lf &Decimal,lld Place)
//{
//	Decimal*=Power(10,Place);
//	Decimal+=0.5;
//	Decimal = (lld)Decimal;
//	Decimal/=Power(10,Place);
//	return Decimal;
//}
//// 素数判定
//bool Is_prime(lld number)
//{
//	if(number<2) return false;
//	for(lld factor=2;factor<=number/factor;factor++)
//		if(number%factor == 0) return false;
//	return true;
//}
//// 最近公共祖先（s 为根节点编号）
//lld n,m,s;
//lld deep[siz],father[siz],jump[siz][30];
//vector<lld> edge[siz];
//void pre(lld now,lld from)
//{
//	father[now] = from;
//	deep[now] = deep[from]+1;
//	jump[now][0] = from;
//	for(lld i=1;i<=19;i++)
//		jump[now][i] = jump[jump[now][i-1]][i-1];
//	for(lld next:edge[now])
//		if(next!=from)
//			pre(next,now);
//}
//lld LCA(lld u,lld v)
//{
//	if(deep[u] < deep[v]) swap(u,v);
//	for(lld i=19;i>=0;i--)
//		if(deep[jump[u][i]] >= deep[v])
//			u = jump[u][i];
//	if(u == v) return u;
//	for(lld i=19;i>=0;i--)
//		if(jump[u][i] != jump[v][i])
//			u = jump[u][i],v = jump[v][i];
//	return jump[u][0];
//}
//// 迪杰斯特拉
//struct node
//{
//	long long now_pos;
//	long long now_dist;
//	friend bool operator <(node node_a,node node_b)
//	{
//		return node_a.now_dist>node_b.now_dist;
//		//Priority_queue's greater is smaller,smaller is greater
//	}
//};
//struct edge
//{
//	long long to_node;
//	long long to_weight;
//};
//void dijkstra()
//{
//	memset(distance,0x3f,sizeof distance);
//	distance[begin_node] = 0;
//	priority_queue<node> update_nodes;
//	update_nodes.push((node){0, begin_node});
//
//	while(!update_nodes.empty())
//	{
//		node now_node = update_nodes.top();
//		update_nodes.pop();
//
//		if(now_node.now_dist > distance[current_node])
//			continue; // Delete the useless node
//
//		for(edge next_node : nodes[now_node.now_pos])
//		{
//			if(distance[next_node.to_node] > distance[now_node.now_pos]+next_node.to_weight)
//			{	// Relex operator
//				distance[next_node.to_node] = distance[now_node.now_pos]+next_node.to_weight;
//				update_nodes.push({distance[next_node.to_node],next_node.to_node});
//			}
//		}
//	}
//}
//// 弗洛伊德
//void Floyd()
//{
//	scanf("%lld %lld",&n,&m);
//	for(int i=1;i<=n;i++)
//		for(int j=1;j<=n;j++)
//			i == j?distance[i][j] = 0:distance[i][j] = INF;
//	for(int i=1;i<=m;i++)
//	{
//		lld u,v,w;
//		scanf("%lld %lld %lld",&u,&v,&w);
//		distance[u][v] = min(distance[u][v],w);
//		distance[v][u] = min(distance[u][v],w);
//	}
//	for(int split=1;split<=n;split++)
//		for(int begin=1;begin<=n;begin++)
//			for(int end=1;end<=n;end++)
//				if(distance[begin][split] != INF && distance[split][end] != INF)
//					distance[begin][end] = min(dp[begin][end],dp[begin][split]+dp[split][end]);
//}
//// 多重转01（二进制优化）
//for(int i=1;i<=n_before;i++)
//{
//	lld now_quantity = 1,remain_quantity = quantity[i];
//	while(remain_quantity)
//	{
//		n_now++;
//		value[n_now] = value_before[i]*min(now_quantity,remain_quantity);
//		weight[n_now] = weight_before[i]*min(now_quantity,remain_quantity);
//		remain_quantity-=min(now_quantity,remain_quantity); now_quantity*=2;
//	}
//}
//struct fantastic     //嗯，开始重载了
//{
//    int len,s[9999];
//    fantastic()
//    {
//        memset(s,0,sizeof(s));
//        len=1;
//    }
//    fantastic operator=(const char*num)
//    {
//        len=strlen(num);
//        for(int i=0;i<len;++i)
//            s[i]=num[len-i-1]-'0';
//        return *this;
//    }
//    fantastic operator=(const int num)
//    {
//        char a[9999];
//        sprintf(a,"%d",num);
//        *this=a;
//        return *this;
//    }
//    fantastic (const int num)
//    {
//        *this=num;
//    }
//    fantastic (const char * num)
//    {
//        *this=num;
//    }
//    fantastic operator+(const fantastic &a)   //这里在重载 “+” 的运算
//    {
//        fantastic c;
//        c.len=max(len,a.len)+1;                //这里就是我们熟悉的竖式模拟了
//        for(int i=0,x=0;i<c.len;++i)
//        {
//            c.s[i]=s[i]+a.s[i]+x;
//            x=c.s[i]/10;
//            c.s[i]=c.s[i]%10;
//        }
//        if(c.s[c.len-1]==0)
//            --c.len;
//        return c;
//    }
//    fantastic operator * (const fantastic &x)           //然后再来波 “*” 的运算
//    {
//        fantastic c;
//        c.len=len+x.len;                 //又是我们熟悉的竖式模拟
//        for(int i=0;i<len;++i)
//            for(int j=0;j<x.len;++j)
//            {
//                c.s[i+j]+=s[i]*x.s[j];
//                c.s[i+j+1]+=c.s[i+j]/10;
//                c.s[i+j]%=10;
//            }
//        if(c.s[c.len-1]==0)
//            --c.len;
//        return c;
//    }
//};
//ostream& operator<<(ostream &out,const fantastic& x)   //重载一下输出
//{
//    for(int i=x.len-1;i>=0;--i)
//        cout<<x.s[i];
//    return out;
//}
//istream& operator>>(istream &in,fantastic &x)       //重载一下输入
//{
//    char num[9999];
//    in>>num;
//    x=num;
//    return in;
//}
template <const unsigned long long mod, const unsigned long long tmp = (-mod) / mod + 1>
struct Modint {
    long long val;
    Modint() = default;
    template <typename type>
    Modint(const type &num) {
        val = barrett(static_cast<unsigned long long>((num % mod + mod) % mod));
    }
    long long barrett(unsigned long long num) const {
        unsigned long long res = num - ((__uint128_t)num * tmp >> 64) * mod;
        return res >= mod ? res - mod : res;
    }
    long long inverse(long long num) const {
        long long a = 0, b = 1, x = num, y = mod, t;
        while (x) {
            t = y / x;
            std::swap(x, y -= t * x);
            std::swap(a -= t * b, b);
        }
        return a < 0 ? a + mod : a;
    }
    const long long &operator()() const { return val; }
    Modint &operator+=(const Modint &rhs) {
        if ((val += rhs() - mod) < 0) val += mod;
        return *this;
    }
    Modint &operator-=(const Modint &rhs) {
        if ((val -= rhs()) < 0) val += mod;
        return *this;
    }
    Modint &operator*=(const Modint &rhs) {
        val = barrett((__uint128_t)val * rhs());
        return *this;
    }
    Modint &operator/=(const Modint &rhs) {
        val = barrett((__uint128_t)val * inverse(rhs()));
        return *this;
    }
    template <typename type>
    Modint &operator^=(const type &rhs)
	{
        Modint base = *this, res = 1;
        type exp = rhs;
        while (exp) {
            if (exp & 1) res *= base;
            base *= base;
            exp >>= 1;
        }
        return *this = res;
    }
    friend Modint operator+(Modint lhs, const Modint &rhs) { return lhs += rhs; }
    friend Modint operator-(Modint lhs, const Modint &rhs) { return lhs -= rhs; }
    friend Modint operator*(Modint lhs, const Modint &rhs) { return lhs *= rhs; }
    friend Modint operator/(Modint lhs, const Modint &rhs) { return lhs /= rhs; }
    template <typename type>
    friend Modint operator^(Modint lhs, const type &rhs) { return lhs ^= rhs; }
    Modint operator+() const { return *this; }
    Modint operator-() const { return Modint() - *this; }
    Modint &operator++() { return *this += 1; }
    Modint operator++ (int) { Modint res = *this; *this += 1; return res; }
    Modint &operator--() { return *this -= 1; }
    Modint operator--(int) { Modint res = *this; *this -= 1; return res; }
    friend bool operator==(const Modint &lhs, const Modint &rhs) { return lhs() == rhs(); }
    friend bool operator!=(const Modint &lhs, const Modint &rhs) { return lhs() != rhs(); }
    friend bool operator>=(const Modint &lhs, const Modint &rhs) { return lhs() >= rhs(); }
    friend bool operator<=(const Modint &lhs, const Modint &rhs) { return lhs() <= rhs(); }
    friend bool operator>(const Modint &lhs, const Modint &rhs) { return lhs() > rhs(); }
    friend bool operator<(const Modint &lhs, const Modint &rhs) { return lhs() < rhs(); }
};
inline int read()
{
    int x=0,f=1;char ch=getchar();
    while(!isdigit(ch)){if(ch=='-') f=-1;ch=getchar();}
    while(isdigit(ch)){x=x*10+ch-'0';ch=getchar();}
    return x*f;
}
inline void write(int x)
{
    if(x<0){putchar('-');x=-x;}
    if(x>9) write(x/10);
    putchar(x%10+'0');
}
#define int long long
const int mod1=19650827;
const int mod=1e9+7;
const int maxn=45;
int a[maxn][maxn];
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int n;
	cin>>n;
	int x=1,y=n/2+1;
	memset(a,-1,sizeof(a));
	for(int i=1;i<=n*n;i++)
	{
		a[x][y]=i;
		if(x==1 && y!=n)
		{
			x=n;
			y++;
		}
		else if(x!=1 && y==n)
		{
			x--;
			y=1;
		}
		else if(x==1 && y==n)
		{
			x++;
		}
		else if(x!=1 && y!=n)
		{
			if(a[x-1][y+1]==-1)
			{
				x--;
				y++;
			}
			else
			{
				x++;
			}
		}
	}
	for(int i=1;i<=n;i++)
	{
		for(int j=1;j<=n;j++)
		{
			cout<<a[i][j]<<' ';
		}
		cout<<'\n';
	}
	return 0;
}





