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
class BigInt
{
#define Value(x, nega) ((nega) ? -(x) : (x))
#define At(vec, index) ((index) < vec.size() ? vec[(index)] : 0)
    //C风格的比较函数,其正负等于abs(lhs)-abs(rhs)的正负
    static int absComp(const BigInt &lhs, const BigInt &rhs)
    {
        if (lhs.size() != rhs.size())
            return lhs.size() < rhs.size() ? -1 : 1;
        for (int i = lhs.size() - 1; i >= 0; --i)
            if (lhs[i] != rhs[i])
                return lhs[i] < rhs[i] ? -1 : 1;
        return 0;
    }
    using Long = long long;
    const static int Exp = 9;
    const static Long Mod = 1000000000;
    mutable std::vector<Long> val;
    mutable bool nega = false;
    //规定:0的nega必须是false,0的size必须是0
    void trim() const
    {
        while (val.size() && val.back() == 0)
            val.pop_back();
        if (val.empty())
            nega = false;
    }
    int size() const { return val.size(); }
    Long &operator[](int index) const { return val[index]; }
    Long &back() const { return val.back(); }
    BigInt(int size, bool nega) : val(size), nega(nega) {}
    BigInt(const std::vector<Long> &val, bool nega) : val(val), nega(nega) {}

  public:
    friend std::ostream &operator<<(std::ostream &os, const BigInt &n)
    {
        if (n.size())
        {
            if (n.nega)
                putchar('-');
            for (int i = n.size() - 1; i >= 0; --i)
            {
                if (i == n.size() - 1)
                    printf("%lld", n[i]);
                else
                    printf("%0*lld", n.Exp, n[i]);
            }
        }
        else
            putchar('0');
        return os;
    }
    friend BigInt operator+(const BigInt &lhs, const BigInt &rhs)
    {
        BigInt ret(lhs);
        return ret += rhs;
    }
    friend BigInt operator-(const BigInt &lhs, const BigInt &rhs)
    {
        BigInt ret(lhs);
        return ret -= rhs;
    }
    BigInt(Long x = 0)
    {
        if (x < 0)
            x = -x, nega = true;
        while (x >= Mod)
            val.push_back(x % Mod), x /= Mod;
        if (x)
            val.push_back(x);
    }
    BigInt(const char *s)
    {
        int bound = 0, pos;
        if (s[0] == '-')
            nega = true, bound = 1;
        Long cur = 0, pow = 1;
        for (pos = strlen(s) - 1; pos >= Exp + bound - 1; pos -= Exp, val.push_back(cur), cur = 0, pow = 1)
            for (int i = pos; i > pos - Exp; --i)
                cur += (s[i] - '0') * pow, pow *= 10;
        for (cur = 0, pow = 1; pos >= bound; --pos)
            cur += (s[pos] - '0') * pow, pow *= 10;
        if (cur)
            val.push_back(cur);
    }
    BigInt &operator+=(const BigInt &rhs)
    {
        const int cap = std::max(size(), rhs.size()) + 1;
        val.resize(cap);
        int carry = 0;
        for (int i = 0; i < cap - 1; ++i)
        {
            val[i] = Value(val[i], nega) + Value(At(rhs, i), rhs.nega) + carry, carry = 0;
            if (val[i] >= Mod)
                val[i] -= Mod, carry = 1; //至多只需要减一次，不需要取模
            else if (val[i] < 0)
                val[i] += Mod, carry = -1; //同理
        }
        if ((val.back() = carry) == -1) //assert(val.back() == 1 or 0 or -1)
        {
            nega = true, val.pop_back();
            bool tailZero = true;
            for (int i = 0; i < cap - 1; ++i)
            {
                if (tailZero && val[i])
                    val[i] = Mod - val[i], tailZero = false;
                else
                    val[i] = Mod - 1 - val[i];
            }
        }
        trim();
        return *this;
    }
    friend BigInt operator-(const BigInt &rhs)
    {
        BigInt ret(rhs);
        ret.nega ^= 1;
        return ret;
    }
    BigInt &operator-=(const BigInt &rhs)
    {
        rhs.nega ^= 1;
        *this += rhs;
        rhs.nega ^= 1;
        return *this;
    }
    //高精*高精没办法原地操作，所以实现operator*
    //高精*低精可以原地操作，所以operator*=
    friend BigInt operator*(const BigInt &lhs, const BigInt &rhs)
    {
        const int cap = lhs.size() + rhs.size() + 1;
        BigInt ret(cap, lhs.nega ^ rhs.nega);
        //j < l.size(),i - j < rhs.size() => i - rhs.size() + 1 <= j
        for (int i = 0; i < cap - 1; ++i) // assert(0 <= ret[cap-1] < Mod)
            for (int j = std::max(i - rhs.size() + 1, 0), up = std::min(i + 1, lhs.size()); j < up; ++j)
            {
                ret[i] += lhs[j] * rhs[i - j];
                ret[i + 1] += ret[i] / Mod, ret[i] %= Mod;
            }
        ret.trim();
        return ret;
    }
    BigInt &operator*=(const BigInt &rhs) { return *this = *this * rhs; }
    friend BigInt operator/(const BigInt &lhs, const BigInt &rhs)
    {
        static std::vector<BigInt> powTwo{BigInt(1)};
        static std::vector<BigInt> estimate;
        estimate.clear();
        if (absComp(lhs, rhs) < 0)
            return BigInt();
        BigInt cur = rhs;
        int cmp;
        while ((cmp = absComp(cur, lhs)) <= 0)
        {
            estimate.push_back(cur), cur += cur;
            if (estimate.size() >= powTwo.size())
                powTwo.push_back(powTwo.back() + powTwo.back());
        }
        if (cmp == 0)
            return BigInt(powTwo.back().val, lhs.nega ^ rhs.nega);
        BigInt ret = powTwo[estimate.size() - 1];
        cur = estimate[estimate.size() - 1];
        for (int i = estimate.size() - 1; i >= 0 && cmp != 0; --i)
            if ((cmp = absComp(cur + estimate[i], lhs)) <= 0)
                cur += estimate[i], ret += powTwo[i];
        ret.nega = lhs.nega ^ rhs.nega;
        return ret;
    }
    bool operator==(const BigInt &rhs) const
    {
        return nega == rhs.nega && val == rhs.val;
    }
    bool operator!=(const BigInt &rhs) const { return nega != rhs.nega || val != rhs.val; }
    bool operator>=(const BigInt &rhs) const { return !(*this < rhs); }
    bool operator>(const BigInt &rhs) const { return !(*this <= rhs); }
    bool operator<=(const BigInt &rhs) const
    {
        if (nega && !rhs.nega)
            return true;
        if (!nega && rhs.nega)
            return false;
        int cmp = absComp(*this, rhs);
        return nega ? cmp >= 0 : cmp <= 0;
    }
    bool operator<(const BigInt &rhs) const
    {
        if (nega && !rhs.nega)
            return true;
        if (!nega && rhs.nega)
            return false;
        return (absComp(*this, rhs) < 0) ^ nega;
    }
    void swap(const BigInt &rhs) const
    {
        std::swap(val, rhs.val);
        std::swap(nega, rhs.nega);
    }
};
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
const int maxn=2e3+5;
char a[maxn],b[maxn];
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	scanf("%s%s",a,b);
	BigInt aa(a);
	BigInt bb(b);
	cout<<aa/bb;
	return 0;
}






