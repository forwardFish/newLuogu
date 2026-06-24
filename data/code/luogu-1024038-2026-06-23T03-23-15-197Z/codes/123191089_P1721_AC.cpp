#include<bits/stdc++.h>
#define inf 1e15
#define N 8005
#define mp make_pair
#define pb push_back
#define fi first
#define se second
#define il inline
#define file(x) freopen(x".in","r",stdin);freopen(x".out","w",stdout)
using namespace std;
il int read(){
	int w=0,h=1;char ch=getchar();
	while(ch<'0'||ch>'9'){if(ch=='-')h=-h;ch=getchar();}
	while(ch>='0'&&ch<='9'){w=w*10+ch-'0';ch=getchar();}
	return w*h;
}
const int PREC = 3100;
class Decimal {
	public:
		Decimal();
		Decimal(const std::string &s);
		Decimal(const char *s);
		Decimal(int x);
		Decimal(long long x);
		Decimal(double x);
		bool is_zero() const;
		std::string to_string(int p) const;
		double to_double() const;
		friend Decimal operator + (const Decimal &a, const Decimal &b);
		friend Decimal operator + (const Decimal &a, int x);
		friend Decimal operator + (int x, const Decimal &a);
		friend Decimal operator + (const Decimal &a, long long x);
		friend Decimal operator + (long long x, const Decimal &a);
		friend Decimal operator + (const Decimal &a, double x);
		friend Decimal operator + (double x, const Decimal &a);
		friend Decimal operator - (const Decimal &a, const Decimal &b);
		friend Decimal operator - (const Decimal &a, int x);
		friend Decimal operator - (int x, const Decimal &a);
		friend Decimal operator - (const Decimal &a, long long x);
		friend Decimal operator - (long long x, const Decimal &a);
		friend Decimal operator - (const Decimal &a, double x);
		friend Decimal operator - (double x, const Decimal &a);
		friend Decimal operator * (const Decimal &a, int x);
		friend Decimal operator * (int x, const Decimal &a);
		friend Decimal operator / (const Decimal &a, int x);
		friend bool operator < (const Decimal &a, const Decimal &b);
		friend bool operator > (const Decimal &a, const Decimal &b);
		friend bool operator <= (const Decimal &a, const Decimal &b);
		friend bool operator >= (const Decimal &a, const Decimal &b);
		friend bool operator == (const Decimal &a, const Decimal &b);
		friend bool operator != (const Decimal &a, const Decimal &b);
		Decimal & operator += (int x);
		Decimal & operator += (long long x);
		Decimal & operator += (double x);
		Decimal & operator += (const Decimal &b);
		Decimal & operator -= (int x);
		Decimal & operator -= (long long x);
		Decimal & operator -= (double x);
		Decimal & operator -= (const Decimal &b);
		Decimal & operator *= (int x);
		Decimal & operator /= (int x);
		friend Decimal operator - (const Decimal &a);
		friend Decimal operator * (const Decimal &a, double x);
		friend Decimal operator * (double x, const Decimal &a);
		friend Decimal operator / (const Decimal &a, double x);
		Decimal & operator *= (double x);
		Decimal & operator /= (double x);
	private:
		static const int len = PREC / 9 + 1;
		static const int mo = 1000000000;
		static void append_to_string(std::string &s, long long x);
		bool is_neg;
		long long integer;
		int data[len];
		void init_zero();
		void init(const char *s);
};
Decimal::Decimal() {
	this->init_zero();
}
Decimal::Decimal(const char *s) {
	this->init(s);
}
Decimal::Decimal(const std::string &s) {
	this->init(s.c_str());
}
Decimal::Decimal(int x) {
	this->init_zero();
	if (x < 0) {
		is_neg = true;
		x = -x;
	}
	integer = x;
}
Decimal::Decimal(long long x) {
	this->init_zero();
	if (x < 0) {
		is_neg = true;
		x = -x;
	}
	integer = x;
}
Decimal::Decimal(double x) {
	this->init_zero();
	if (x < 0) {
		is_neg = true;
		x = -x;
	}
	integer = (long long)x;
	x -= integer;
	for (int i = 0; i < len; i++) {
		x *= mo;
		if (x < 0) x = 0;
		data[i] = (int)x;
		x -= data[i];
	}
}
void Decimal::init_zero() {
	is_neg = false;
	integer = 0;
	memset(data, 0, len * sizeof(int));
}
bool Decimal::is_zero() const {
	if (integer) return false;
	for (int i = 0; i < len; i++) {
		if (data[i]) return false;
	}
	return true;
}
void Decimal::init(const char *s) {
	this->init_zero();
	is_neg = false;
	integer = 0;
	while (*s != 0) {
		if (*s == '-') {
			is_neg = true;
			++s;
			break;
		} else if (*s >= 48 && *s <= 57) {
			break;
		}
		++s;
	}
	while (*s >= 48 && *s <= 57) {
		integer = integer * 10 + *s - 48;
		++s;
	}
	if (*s == '.') {
		int pos = 0;
		int x = mo / 10;
		++s;
		while (pos < len && *s >= 48 && *s <= 57) {
			data[pos] += (*s - 48) * x;
			++s;
			x /= 10;
			if (x == 0) {
				++pos;
				x = mo / 10;
			}
		}
	}
}
void Decimal::append_to_string(std::string &s, long long x) {
	if (x == 0) {
		s.append(1, 48);
		return;
	}
	char _[30];
	int cnt = 0;
	while (x) {
		_[cnt++] = x % 10;
		x /= 10;
	}
	while (cnt--) {
		s.append(1, _[cnt] + 48);
	}
}
std::string Decimal::to_string(int p) const {
	std::string ret;
	if (is_neg && !this->is_zero()) {
		ret = "-";
	}
	append_to_string(ret, this->integer);
	ret.append(1, '.');
	for (int i = 0; i < len; i++) {
		int x = mo / 10;
		int tmp = data[i];
		while (x) {
			ret.append(1, 48 + tmp / x);
			tmp %= x;
			x /= 10;
			if (--p == 0) {
				break;
			}
		}
		if (p == 0) break;
	}
	if (p > 0) {
		ret.append(p, '0');
	}
	return ret;
}
double Decimal::to_double() const {
	double ret = integer;
	double k = 1.0;
	for (int i = 0; i < len; i++) {
		k /= mo;
		ret += k * data[i];
	}
	if (is_neg) {
		ret = -ret;
	}
	return ret;
}
bool operator < (const Decimal &a, const Decimal &b) {
	if (a.is_neg != b.is_neg) {
		return a.is_neg && (!a.is_zero() || !b.is_zero());
	} else if (!a.is_neg) {
		if (a.integer != b.integer) {
			return a.integer < b.integer;
		}
		for (int i = 0; i < Decimal::len; i++) {
			if (a.data[i] != b.data[i]) {
				return a.data[i] < b.data[i];
			}
		}
		return false;
	} else {
		if (a.integer != b.integer) {
			return a.integer > b.integer;
		}
		for (int i = 0; i < Decimal::len; i++) {
			if (a.data[i] != b.data[i]) {
				return a.data[i] > b.data[i];
			}
		}
		return false;
	}
}
bool operator > (const Decimal &a, const Decimal &b) {
	if (a.is_neg != b.is_neg) {
		return !a.is_neg && (!a.is_zero() || !b.is_zero());
	} else if (!a.is_neg) {
		if (a.integer != b.integer) {
			return a.integer > b.integer;
		}
		for (int i = 0; i < Decimal::len; i++) {
			if (a.data[i] != b.data[i]) {
				return a.data[i] > b.data[i];
			}
		}
		return false;
	} else {
		if (a.integer != b.integer) {
			return a.integer < b.integer;
		}
		for (int i = 0; i < Decimal::len; i++) {
			if (a.data[i] != b.data[i]) {
				return a.data[i] < b.data[i];
			}
		}
		return false;
	}
}
bool operator <= (const Decimal &a, const Decimal &b) {
	if (a.is_neg != b.is_neg) {
		return a.is_neg || (a.is_zero() && b.is_zero());
	} else if (!a.is_neg) {
		if (a.integer != b.integer) {
			return a.integer < b.integer;
		}
		for (int i = 0; i < Decimal::len; i++) {
			if (a.data[i] != b.data[i]) {
				return a.data[i] < b.data[i];
			}
		}
		return true;
	} else {
		if (a.integer != b.integer) {
			return a.integer > b.integer;
		}
		for (int i = 0; i < Decimal::len; i++) {
			if (a.data[i] != b.data[i]) {
				return a.data[i] > b.data[i];
			}
		}
		return true;
	}
}
bool operator >= (const Decimal &a, const Decimal &b) {
	if (a.is_neg != b.is_neg) {
		return !a.is_neg || (a.is_zero() && b.is_zero());
	} else if (!a.is_neg) {
		if (a.integer != b.integer) {
			return a.integer > b.integer;
		}
		for (int i = 0; i < Decimal::len; i++) {
			if (a.data[i] != b.data[i]) {
				return a.data[i] > b.data[i];
			}
		}
		return true;
	} else {
		if (a.integer != b.integer) {
			return a.integer < b.integer;
		}
		for (int i = 0; i < Decimal::len; i++) {
			if (a.data[i] != b.data[i]) {
				return a.data[i] < b.data[i];
			}
		}
		return true;
	}
}
bool operator == (const Decimal &a, const Decimal &b) {
	if (a.is_zero() && b.is_zero()) return true;
	if (a.is_neg != b.is_neg) return false;
	if (a.integer != b.integer) return false;
	for (int i = 0; i < Decimal::len; i++) {
		if (a.data[i] != b.data[i]) return false;
	}
	return true;
}
bool operator != (const Decimal &a, const Decimal &b) {
	return !(a == b);
}
Decimal & Decimal::operator += (long long x) {
	if (!is_neg) {
		if (integer + x >= 0) {
			integer += x;
		} else {
			bool last = false;
			for (int i = len - 1; i >= 0; i--) {
				if (last || data[i]) {
					data[i] = mo - data[i] - last;
					last = true;
				} else {
					last = false;
				}
			}
			integer = -x - integer - last;
			is_neg = true;
		}
	} else {
		if (integer - x >= 0) {
			integer -= x;
		} else {
			bool last = false;
			for (int i = len - 1; i >= 0; i--) {
				if (last || data[i]) {
					data[i] = mo - data[i] - last;
					last = true;
				} else {
					last = false;
				}
			}
			integer = x - integer - last;
			is_neg = false;
		}
	}
	return *this;
}
Decimal & Decimal::operator += (int x) {
	return *this += (long long)x;
}
Decimal & Decimal::operator -= (int x) {
	return *this += (long long)-x;
}
Decimal & Decimal::operator -= (long long x) {
	return *this += -x;
}
Decimal & Decimal::operator /= (int x) {
	if (x < 0) {
		is_neg ^= 1;
		x = -x;
	}
	int last = integer % x;
	integer /= x;
	for (int i = 0; i < len; i++) {
		long long tmp = 1LL * last * mo + data[i];
		data[i] = tmp / x;
		last = tmp - 1LL * data[i] * x;
	}
	if (is_neg && integer == 0) {
		int i;
		for (i = 0; i < len; i++) {
			if (data[i] != 0) {
				break;
			}
		}
		if (i == len) {
			is_neg = false;
		}
	}
	return *this;
}
Decimal & Decimal::operator *= (int x) {
	if (x < 0) {
		is_neg ^= 1;
		x = -x;
	} else if (x == 0) {
		init_zero();
		return *this;
	}
	int last = 0;
	for (int i = len - 1; i >= 0; i--) {
		long long tmp = 1LL * data[i] * x + last;
		last = tmp / mo;
		data[i] = tmp - 1LL * last * mo;
	}
	integer = integer * x + last;
	return *this;
}
Decimal operator - (const Decimal &a) {
	Decimal ret = a;
	if (!ret.is_neg && ret.integer == 0) {
		int i;
		for (i = 0; i < Decimal::len; i++) {
			if (ret.data[i] != 0) break;
		}
		if (i < Decimal::len) {
			ret.is_neg = true;
		}
	} else {
		ret.is_neg ^= 1;
	}
	return ret;
}
Decimal operator + (const Decimal &a, int x) {
	Decimal ret = a;
	return ret += x;
}
Decimal operator + (int x, const Decimal &a) {
	Decimal ret = a;
	return ret += x;
}
Decimal operator + (const Decimal &a, long long x) {
	Decimal ret = a;
	return ret += x;
}
Decimal operator + (long long x, const Decimal &a) {
	Decimal ret = a;
	return ret += x;
}
Decimal operator - (const Decimal &a, int x) {
	Decimal ret = a;
	return ret -= x;
}
Decimal operator - (int x, const Decimal &a) {
	return -(a - x);
}
Decimal operator - (const Decimal &a, long long x) {
	Decimal ret = a;
	return ret -= x;
}
Decimal operator - (long long x, const Decimal &a) {
	return -(a - x);
}
Decimal operator * (const Decimal &a, int x) {
	Decimal ret = a;
	return ret *= x;
}
Decimal operator * (int x, const Decimal &a) {
	Decimal ret = a;
	return ret *= x;
}
Decimal operator / (const Decimal &a, int x) {
	Decimal ret = a;
	return ret /= x;
}
Decimal operator + (const Decimal &a, const Decimal &b) {
	if (a.is_neg == b.is_neg) {
		Decimal ret = a;
		bool last = false;
		for (int i = Decimal::len - 1; i >= 0; i--) {
			ret.data[i] += b.data[i] + last;
			if (ret.data[i] >= Decimal::mo) {
				ret.data[i] -= Decimal::mo;
				last = true;
			} else {
				last = false;
			}
		}
		ret.integer += b.integer + last;
		return ret;
	} else if (!a.is_neg) {
		return a - -b;
	} else {
		return b - -a;
	}
}
Decimal operator - (const Decimal &a, const Decimal &b) {
	if (!a.is_neg && !b.is_neg) {
		if (a >= b) {
			Decimal ret = a;
			bool last = false;
			for (int i = Decimal::len - 1; i >= 0; i--) {
				ret.data[i] -= b.data[i] + last;
				if (ret.data[i] < 0) {
					ret.data[i] += Decimal::mo;
					last = true;
				} else {
					last = false;
				}
			}
			ret.integer -= b.integer + last;
			return ret;
		} else {
			Decimal ret = b;
			bool last = false;
			for (int i = Decimal::len - 1; i >= 0; i--) {
				ret.data[i] -= a.data[i] + last;
				if (ret.data[i] < 0) {
					ret.data[i] += Decimal::mo;
					last = true;
				} else {
					last = false;
				}
			}
			ret.integer -= a.integer + last;
			ret.is_neg = true;
			return ret;
		}
	} else if (a.is_neg && b.is_neg) {
		return -b - -a;
	} else if (a.is_neg) {
		return -(-a + b);
	} else {
		return a + -b;
	}
}
Decimal operator + (const Decimal &a, double x) {
	return a + Decimal(x);
}
Decimal operator + (double x, const Decimal &a) {
	return Decimal(x) + a;
}
Decimal operator - (const Decimal &a, double x) {
	return a - Decimal(x);
}
Decimal operator - (double x, const Decimal &a) {
	return Decimal(x) - a;
}
Decimal & Decimal::operator += (double x) {
	*this = *this + Decimal(x);
	return *this;
}
Decimal & Decimal::operator -= (double x) {
	*this = *this - Decimal(x);
	return *this;
}
Decimal & Decimal::operator += (const Decimal &b) {
	*this = *this + b;
	return *this;
}
Decimal & Decimal::operator -= (const Decimal &b) {
	*this = *this - b;
	return *this;
}
Decimal ans;
int n,K,p,cnt;
int H[N],Sum[N];
double dp[N][25];
int pos[N][25];
int q[N],hd,tl;
vector<pair<double,double> >t;
double Slope(int i,int j){return(double)(t[j].se-t[i].se)/(t[j].fi-t[i].fi);}
Decimal print(int cur,int stp){
	if(stp==0)return H[1];
	return(print(pos[cur][stp],stp-1)+Sum[cur]-Sum[pos[cur][stp]])/(cur-pos[cur][stp]+1);
}
signed main(){
	n=read();K=read();p=read();H[++cnt]=read();
	for(int i=2;i<=n;i++){
		int x=read();
		if(x>H[1])H[++cnt]=x;
	}
	n=cnt;
	sort(H+1,H+n+1);
	for(int i=1;i<=n;i++)Sum[i]=Sum[i-1]+H[i];
	for(int i=1;i<=n;i++)dp[i][0]=H[1];
	K=min(K,n);
	int lim=min(K,14);
	for(cnt=1;cnt<=lim;cnt++){
		hd=1;tl=0;
		q[++tl]=1;
		t.clear();t.pb(mp(0,0));
		for(int i=1;i<=n;i++)t.pb(mp(i-1,Sum[i]-dp[i][cnt-1]));
		for(int i=2;i<=n;i++){
			t.pb(mp(i,Sum[i]));
			while(hd<tl&&Slope(n+1,q[hd])<Slope(n+1,q[hd+1]))hd++;
			t.pop_back();
			pos[i][cnt]=q[hd];
			dp[i][cnt]=1.*(dp[q[hd]][cnt-1]+Sum[i]-Sum[q[hd]])/(i-q[hd]+1);
			while(hd<tl&&Slope(q[tl-1],q[tl])>Slope(q[tl],i))tl--;
			q[++tl]=i;
		}
	}
	cnt=n-K+lim;
	int id=0;
	for(int i=0;i<=lim;i++)
		if(dp[cnt][i]>dp[cnt][id])id=i;
	ans=print(cnt,id);
	for(int i=cnt+1;i<=n;i++)ans=(ans+H[i])/2;
	cout<<ans.to_string(p<<1)<<endl;
	return 0;
}