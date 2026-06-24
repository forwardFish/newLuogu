#include<bits/stdc++.h>
using ll=long long;
using lld=unsigned long long;
using namespace std;
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
//class BigInt
//{
//#define Value(x, nega) ((nega) ? -(x) : (x))
//#define At(vec, index) ((index) < vec.size() ? vec[(index)] : 0)
//    //C·ç¸ñµÄ±È½Ïº¯Êý,ÆäÕý¸ºµÈÓÚabs(lhs)-abs(rhs)µÄÕý¸º
//    static int absComp(const BigInt &lhs, const BigInt &rhs)
//    {
//        if (lhs.size() != rhs.size())
//            return lhs.size() < rhs.size() ? -1 : 1;
//        for (int i = lhs.size() - 1; i >= 0; --i)
//            if (lhs[i] != rhs[i])
//                return lhs[i] < rhs[i] ? -1 : 1;
//        return 0;
//    }
//    using Long = long long;
//    const static int Exp = 9;
//    const static Long Mod = 1000000000;
//    mutable std::vector<Long> val;
//    mutable bool nega = false;
//    //¹æ¶¨:0µÄnega±ØÐëÊÇfalse,0µÄsize±ØÐëÊÇ0
//    void trim() const
//    {
//        while (val.size() && val.back() == 0)
//            val.pop_back();
//        if (val.empty())
//            nega = false;
//    }
//    int size() const { return val.size(); }
//    Long &operator[](int index) const { return val[index]; }
//    Long &back() const { return val.back(); }
//    BigInt(int size, bool nega) : val(size), nega(nega) {}
//    BigInt(const std::vector<Long> &val, bool nega) : val(val), nega(nega) {}
//
//  public:
//    friend std::ostream &operator<<(std::ostream &os, const BigInt &n)
//    {
//        if (n.size())
//        {
//            if (n.nega)
//                putchar('-');
//            for (int i = n.size() - 1; i >= 0; --i)
//            {
//                if (i == n.size() - 1)
//                    printf("%lld", n[i]);
//                else
//                    printf("%0*lld", n.Exp, n[i]);
//            }
//        }
//        else
//            putchar('0');
//        return os;
//    }
//    friend BigInt operator+(const BigInt &lhs, const BigInt &rhs)
//    {
//        BigInt ret(lhs);
//        return ret += rhs;
//    }
//    friend BigInt operator-(const BigInt &lhs, const BigInt &rhs)
//    {
//        BigInt ret(lhs);
//        return ret -= rhs;
//    }
//    BigInt(Long x = 0)
//    {
//        if (x < 0)
//            x = -x, nega = true;
//        while (x >= Mod)
//            val.push_back(x % Mod), x /= Mod;
//        if (x)
//            val.push_back(x);
//    }
//    BigInt(const char *s)
//    {
//        int bound = 0, pos;
//        if (s[0] == '-')
//            nega = true, bound = 1;
//        Long cur = 0, pow = 1;
//        for (pos = strlen(s) - 1; pos >= Exp + bound - 1; pos -= Exp, val.push_back(cur), cur = 0, pow = 1)
//            for (int i = pos; i > pos - Exp; --i)
//                cur += (s[i] - '0') * pow, pow *= 10;
//        for (cur = 0, pow = 1; pos >= bound; --pos)
//            cur += (s[pos] - '0') * pow, pow *= 10;
//        if (cur)
//            val.push_back(cur);
//    }
//    BigInt &operator+=(const BigInt &rhs)
//    {
//        const int cap = std::max(size(), rhs.size()) + 1;
//        val.resize(cap);
//        int carry = 0;
//        for (int i = 0; i < cap - 1; ++i)
//        {
//            val[i] = Value(val[i], nega) + Value(At(rhs, i), rhs.nega) + carry, carry = 0;
//            if (val[i] >= Mod)
//                val[i] -= Mod, carry = 1; //ÖÁ¶àÖ»ÐèÒª¼õÒ»´Î£¬²»ÐèÒªÈ¡Ä£
//            else if (val[i] < 0)
//                val[i] += Mod, carry = -1; //Í¬Àí
//        }
//        if ((val.back() = carry) == -1) //assert(val.back() == 1 or 0 or -1)
//        {
//            nega = true, val.pop_back();
//            bool tailZero = true;
//            for (int i = 0; i < cap - 1; ++i)
//            {
//                if (tailZero && val[i])
//                    val[i] = Mod - val[i], tailZero = false;
//                else
//                    val[i] = Mod - 1 - val[i];
//            }
//        }
//        trim();
//        return *this;
//    }
//    friend BigInt operator-(const BigInt &rhs)
//    {
//        BigInt ret(rhs);
//        ret.nega ^= 1;
//        return ret;
//    }
//    BigInt &operator-=(const BigInt &rhs)
//    {
//        rhs.nega ^= 1;
//        *this += rhs;
//        rhs.nega ^= 1;
//        return *this;
//    }
//    //¸ß¾«*¸ß¾«Ã»°ì·¨Ô­µØ²Ù×÷£¬ËùÒÔÊµÏÖoperator*
//    //¸ß¾«*µÍ¾«¿ÉÒÔÔ­µØ²Ù×÷£¬ËùÒÔoperator*=
//    friend BigInt operator*(const BigInt &lhs, const BigInt &rhs)
//    {
//        const int cap = lhs.size() + rhs.size() + 1;
//        BigInt ret(cap, lhs.nega ^ rhs.nega);
//        //j < l.size(),i - j < rhs.size() => i - rhs.size() + 1 <= j
//        for (int i = 0; i < cap - 1; ++i) // assert(0 <= ret[cap-1] < Mod)
//            for (int j = std::max(i - rhs.size() + 1, 0), up = std::min(i + 1, lhs.size()); j < up; ++j)
//            {
//                ret[i] += lhs[j] * rhs[i - j];
//                ret[i + 1] += ret[i] / Mod, ret[i] %= Mod;
//            }
//        ret.trim();
//        return ret;
//    }
//    BigInt &operator*=(const BigInt &rhs) { return *this = *this * rhs; }
//    friend BigInt operator/(const BigInt &lhs, const BigInt &rhs)
//    {
//        static std::vector<BigInt> powTwo{BigInt(1)};
//        static std::vector<BigInt> estimate;
//        estimate.clear();
//        if (absComp(lhs, rhs) < 0)
//            return BigInt();
//        BigInt cur = rhs;
//        int cmp;
//        while ((cmp = absComp(cur, lhs)) <= 0)
//        {
//            estimate.push_back(cur), cur += cur;
//            if (estimate.size() >= powTwo.size())
//                powTwo.push_back(powTwo.back() + powTwo.back());
//        }
//        if (cmp == 0)
//            return BigInt(powTwo.back().val, lhs.nega ^ rhs.nega);
//        BigInt ret = powTwo[estimate.size() - 1];
//        cur = estimate[estimate.size() - 1];
//        for (int i = estimate.size() - 1; i >= 0 && cmp != 0; --i)
//            if ((cmp = absComp(cur + estimate[i], lhs)) <= 0)
//                cur += estimate[i], ret += powTwo[i];
//        ret.nega = lhs.nega ^ rhs.nega;
//        return ret;
//    }
//    bool operator==(const BigInt &rhs) const
//    {
//        return nega == rhs.nega && val == rhs.val;
//    }
//    bool operator!=(const BigInt &rhs) const { return nega != rhs.nega || val != rhs.val; }
//    bool operator>=(const BigInt &rhs) const { return !(*this < rhs); }
//    bool operator>(const BigInt &rhs) const { return !(*this <= rhs); }
//    bool operator<=(const BigInt &rhs) const
//    {
//        if (nega && !rhs.nega)
//            return true;
//        if (!nega && rhs.nega)
//            return false;
//        int cmp = absComp(*this, rhs);
//        return nega ? cmp >= 0 : cmp <= 0;
//    }
//    bool operator<(const BigInt &rhs) const
//    {
//        if (nega && !rhs.nega)
//            return true;
//        if (!nega && rhs.nega)
//            return false;
//        return (absComp(*this, rhs) < 0) ^ nega;
//    }
//    void swap(const BigInt &rhs) const
//    {
//        std::swap(val, rhs.val);
//        std::swap(nega, rhs.nega);
//    }
//};
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
//}×î³¤ÉÏÉý×ÓÐòÁÐ
//lld = long long
//lf = double
//// ×î´ó¹«ÒòÊý
//lld GCD(lld number_1,lld number_2)
//{
//	return number_2?GCD(number_2,number_1%number_2):number_1;
//}
//// ×îÐ¡¹«±¶Êý
//lld LCM(lld number_1,lld number_2)
//{
//	return number_1/GCD(number_1,number_2)*number_2;
//}
//// ¾ø¶ÔÖµ
//lf Abs(lf number)
//{
//	return number*(-1+2*(number>0));
//}
//// ¿ìËÙÃÝ
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
//// ¿ìËÙÃÝÈ¡Ä£
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
//// Æ½·½¸ù
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
//// ËÄÉáÎåÈë
//lf Round(lf &Decimal,lld Place)
//{
//	Decimal*=Power(10,Place);
//	Decimal+=0.5;
//	Decimal = (lld)Decimal;
//	Decimal/=Power(10,Place);
//	return Decimal;
//}
//// ËØÊýÅÐ¶¨
//bool prime(lld number)
//{
//	if(number<2) return false;
//	for(lld factor=2;factor<=number/factor;factor++)
//		if(number%factor == 0) return false;
//	return true;
//}
//// ×î½ü¹«¹²×æÏÈ£¨s Îª¸ù½Úµã±àºÅ£©
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
//// µÏ½ÜË¹ÌØÀ­
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
//// ¸¥ÂåÒÁµÂ
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
//// ¶àÖØ×ª01£¨¶þ½øÖÆÓÅ»¯£©
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

#define int long long
const int mod1=19650827;
const int mod=1e9+7;
const int maxn=2e5+5;
int w[maxn],t[maxn],a[maxn];
signed main()
{
	ios::sync_with_stdio(false);
	cin.tie(0);
	cout.tie(0);
	int T;
	cin>>T;
	while(T--)
	{
		int n,k;
		cin>>n>>k;
		for(int i=1;i<=n;i++)
		{
			cin>>w[i]>>t[i];
			a[i]=k-w[i]+t[i];
		}
		sort(a+1,a+n+1);
		for(int i=1;i<=n;i++)
		{
			a[i]=max(a[i],a[i-1]+1);
		}
		cout<<a[n]<<endl;
	}
	return 0;
}




