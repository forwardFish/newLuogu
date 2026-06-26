#include<bits/stdc++.h>
using namespace std;

typedef unsigned char uchar;
typedef long long Int;
typedef Int* IntPtr;
typedef Int* Context;
#define pb push_back
inline bool ishex(char c){
	return c>='0'&&c<='9'||c>='a'&&c<='f'||c>='A'&&c<='F';
}

typedef enum{
	Add,Sub,Mul,Div,Mod,
	Xor,BitAnd,BitOr,LogicAnd,LogicOr,
	Eql,NotEql,Sml,SmlEql,Big,
	BigEql,Not,Positive,Negative,PushInt,
	PopStack,PushFn,Allocate,GetLocal,SetLocal,
	GetGlb,SetGlb,GetAddress,SetAddress,Cout,
	Cin,CoutEndl,Jump,JumpIfFalse,Loop,
	Call,Return,Offset,Putchar,Getchar
} InsType; 

const string insTypeStrings[] = {

        "Add", "Sub", "Mul", "Div", "Mod",

        "Xor", "BitAnd", "BitOr", "LogicAnd", "LogicOr",

        "Eql", "NotEql", "Sml", "SmlEql", "Big",

        "BigEql", "Not", "Positive", "Negative", "PushInt",

        "PopStack", "PushFn", "Allocate", "GetLocal", "SetLocal",

        "GetGlb", "SetGlb", "GetAddress", "SetAddress", "Cout",

        "Cin", "CoutEndl", "Jump", "JumpIfFalse", "Loop",

        "Call", "Return", "Offset", "Putchar", "Getchar"

    };

struct Ins{
	InsType type;
	Int op1;
	Ins(){}
	Ins(InsType type){this->type=type;op1=0;}
	Ins(InsType type,Int op){this->type=type;op1=op;}
};

typedef vector<Ins> Codeset;
inline void Concat(Codeset&a,const Codeset&b){
	for(const auto&x:b)a.pb(x);
}

struct Fn{
	Codeset instr;
	int localCount;
}; 

vector<Fn> fnPool;
namespace tokenizer{
	enum{
		TOK_STR,TOK_NUM,TOK_ID,TOK_HEX,
		TOK_ADD,TOK_SUB,TOK_MUL,TOK_DIV,TOK_MOD,
		TOK_POW,TOK_HASH,
		TOK_EQL,TOK_BIG,TOK_BIGE,TOK_SML,TOK_SMLE,TOK_NEQ,
		TOK_LPR,TOK_RPR,TOK_LBR,TOK_RBR,TOK_LBK,TOK_RBK,
		TOK_SEMICOL,TOK_COL,
		TOK_COMMA,TOK_DOT,TOK_2DOT,TOK_3DOT,TOK_XOR,TOK_LSHF,TOK_RSHF,
		TOK_ASS,
		TOK_AND,TOK_BREAK,TOK_DO,TOK_ELSE,TOK_ELSEIF,
		TOK_END,TOK_FALSE,TOK_FUNCTION,TOK_IF,TOK_IN,
		TOK_LOCAL,TOK_NIL,TOK_NOT,TOK_OR,TOK_REPEAT,TOK_FOR,
		TOK_RETURN,TOK_THEN,TOK_TRUE,
		TOK_BITNOT,
		TOK_WHILE,TOK_UNTIL,
		TOK_INT,TOK_COUT,TOK_CIN,TOK_ENDL,TOK_PUTC,TOK_GETC
	};
	struct token{
		string val;
		int type;
	};
	vector<token> tokens;
	int get_type(const string&s){
		if(s=="int")return TOK_INT;
		if(s=="if")return TOK_IF;
		if(s=="else")return TOK_ELSE;
		if(s=="for")return TOK_FOR;
		if(s=="while")return TOK_WHILE;
		if(s=="return")return TOK_RETURN;
		if(s=="cout")return TOK_COUT;
		if(s=="cin")return TOK_CIN;
		if(s=="endl")return TOK_ENDL;
		if(s=="putchar")return TOK_PUTC;
		if(s=="getchar")return TOK_GETC;
		return TOK_ID;
	}
	void tokenize(const string&s){
		unsigned i=0;
		while(i<s.size()){
			string v="";
			if(isalpha(s[i])||s[i]=='_'){
				v.pb(s[i]),i++;
				while(isalpha(s[i])||isdigit(s[i])||s[i]=='_')v.pb(s[i]),i++;
				if(v=="using"){
					while(s[i]!='\n')i++;
				}
				else tokens.pb({v,get_type(v)});
			}
			else if(isdigit(s[i])){
				v.pb(s[i]),i++;
				while(isdigit(s[i]))v.pb(s[i]),i++;
				tokens.pb({v,TOK_NUM});
			}
			else if(s[i]=='#'){
				while(s[i]!='\n')i++;
			}
			#define PF(x,t)\
			case x: v.pb(s[i]),i++,tokens.pb({v,TOK_##t});break
			else{
				switch(s[i]){
					PF('+',ADD);
					PF('*',MUL);
					PF('/',DIV);
					PF('%',MOD);
					PF('(',LPR);
					PF(')',RPR);
					PF('[',LBK);
					PF(']',RBK);
					PF('{',LBR);
					PF('}',RBR);
					PF(';',SEMICOL);
					PF(':',COL);
					PF(',',COMMA);
					PF('^',XOR);
					case'>':{
						v.pb(s[i]),i++;
						if(s[i]=='=')v.pb(s[i]),i++,tokens.pb({v,TOK_BIGE});
						else if(s[i]=='>')v.pb(s[i]),i++,tokens.pb({v,TOK_RSHF});
						else tokens.pb({v,TOK_BIG});
						break;
					}
					case'<':{
						v.pb(s[i]),i++;
						if(s[i]=='=')v.pb(s[i]),i++,tokens.pb({v,TOK_SMLE});
						else if(s[i]=='<')v.pb(s[i]),i++,tokens.pb({v,TOK_LSHF});
						else tokens.pb({v,TOK_SML});
						break;
					}
					case'=':{
						v.pb(s[i]),i++;
						if(s[i]=='=')v.pb(s[i]),i++,tokens.pb({v,TOK_EQL});
						else tokens.pb({v,TOK_ASS});
						break;
					}
					case'!':{
						v.pb(s[i]),i++;
						if(s[i]=='=')v.pb(s[i]),i++,tokens.pb({v,TOK_NEQ});
						else tokens.pb({v,TOK_NOT});
						break;
					}
					case'|':{
						v.pb(s[i]),i++,v.pb(s[i]),i++,tokens.pb({v,TOK_OR});
						break;
					}
					case'&':{
						v.pb(s[i]),i++,v.pb(s[i]),i++,tokens.pb({v,TOK_AND});
						break;
					}
					case'-':v.pb(s[i]),i++,tokens.pb({v,TOK_SUB});break;
					default:i++;
				}
			}
		}
	}
	#undef PF
}
using namespace tokenizer;

inline int prior(int type){
    switch(type){
        case TOK_ASS:return 200;
        case TOK_OR:return 300;
        case TOK_AND:return 400; 
        case TOK_XOR:return 500; 
        case TOK_EQL:case TOK_NEQ:return 800;
        case TOK_BIG:case TOK_SML:case TOK_BIGE:case TOK_SMLE:return 900;
        case TOK_ADD:case TOK_SUB:return 1100;
        case TOK_MUL:case TOK_DIV:case TOK_MOD:return 1200;
        case TOK_NOT:case TOK_BITNOT:return 1300;
        case TOK_LPR:case TOK_LBK:case TOK_DOT:case TOK_HASH:return 1400;
        default:return 1;
    }
}

typedef map<string,int> LocalScope;
typedef vector<LocalScope> Scope;
typedef map<int,int> ArrVar;

vector<Scope> scopes;
vector<ArrVar> arrayVars;
vector<int> usedLocalCount;
map<string,int> globalScope;
ArrVar globalArrayVars;
map<string,int> funcScope;

inline int VarIdInScope(const string&name){
//	cout<<"VarIdInScope "<<name<<endl;
	int used=0;
	for(auto&localScope:scopes.back()){
		if(localScope.find(name)!=localScope.end()){
			return localScope[name];
		}
		used+=localScope.size();
	}
	scopes.back().back()[name]=used;
	usedLocalCount.back()++; 
	return scopes.back().back()[name];
}
inline bool LocalVarExists(const string&name){
//	cout<<"LocalVarExists "<<name<<endl;
	for(const auto&localScope:scopes.back()){
		if(localScope.find(name)!=localScope.end()){
			return true;
		}
	}
	return false;
}
inline int GlobalVarId(const string&name){
//	cout<<"GlobalVarId "<<name<<endl;
	if(globalScope.find(name)==globalScope.end()){
		int cnt=globalScope.size();
		globalScope[name]=cnt;
	}
	return globalScope[name];
} 
inline Ins LoadVar(const string&name){
//	cout<<"LoadVar "<<name<<endl;
	if(funcScope.find(name)!=funcScope.end()){
//		puts("Finished, fn");
		return {PushFn,funcScope[name]};
	}
	if(scopes.size()&&LocalVarExists(name)){
//		puts("Finished, local");
		return {GetLocal,VarIdInScope(name)};
	}
//	puts("Finished, glb");
	return {GetGlb,GlobalVarId(name)};
}

int tokpos;
#define tok (tokens[tokpos])
#define nexttok() (tokens[tokpos+1])
inline const token&readtok(){
	return tokens[tokpos++];
}

int mainFnId;

Codeset expr(int);
Codeset stmt();

Codeset args(int terminate,int&cnt){
	Codeset s;cnt=0;
	while(tok.type!=terminate){
		Concat(s,expr(0)),cnt++;
		if(tok.type==TOK_COMMA)readtok();
	}
	return s;
}

vector<vector<int> > sizesTable;


Codeset expr(int rbp){
	Codeset s;
	switch(tok.type){
		#define _ readtok();break;
		case TOK_TRUE:s.pb({PushInt,1});_
		case TOK_FALSE:s.pb({PushInt,0});_
		case TOK_SEMICOL:return s;
		case TOK_NUM:s.pb(Ins(PushInt,atol(tok.val.c_str())));_
		case TOK_ID:s.pb(LoadVar(tok.val));_
		case TOK_LPR:readtok();Concat(s,expr(0));_
		case TOK_NOT:readtok();Concat(s,expr(1300));s.pb(Ins(Not));break;
		case TOK_SUB:readtok();Concat(s,expr(1300));s.pb(Ins(Negative));break;
		case TOK_ADD:readtok();Concat(s,expr(1300));s.pb(Ins(Positive));break;
		case TOK_PUTC:{
			readtok();
			readtok();Concat(s,expr(0));readtok();
			s.pb(Ins(Putchar));
			break;
		}
		case TOK_GETC:{
			readtok();
			readtok();readtok();
			s.pb(Ins(Getchar));
			break;
		}
		default:cout<<"unexpected token "+tok.val<<endl;for(int i=0;i<10;i++)cout<<readtok().val<<' ';exit(1);
		#undef _
	}
	#define PF(code){\
		string v=tok.val;\
		int pr=prior(tok.type);\
		readtok();\
		Concat(s,expr(pr));\
		s.pb(Ins(code));\
		break;\
	}
	while(tokpos<(int)tokens.size()&&prior(tok.type)>rbp){
		switch(tok.type){
		case TOK_ADD:PF(Add);
		case TOK_SUB:PF(Sub);
		case TOK_MUL:PF(Mul);
		case TOK_DIV:PF(Div);
		case TOK_MOD:PF(Mod);
		case TOK_XOR:PF(Xor);
		case TOK_EQL:PF(Eql);
		case TOK_NEQ:PF(NotEql);
		case TOK_BIG:PF(Big);
		case TOK_BIGE:PF(BigEql);
		case TOK_SML:PF(Sml);
		case TOK_SMLE:PF(SmlEql);
		case TOK_AND:PF(LogicAnd);
		case TOK_OR:PF(LogicOr);
		case TOK_LBK:{
			int varId=s.back().op1;
			const vector<int>&sizes=sizesTable[(s.back().type==GetLocal?arrayVars.back():globalArrayVars)[varId]]; 
			int dim=1;
			bool first=true;
			while(tok.type==TOK_LBK){
				readtok(); Concat(s,expr(0)); readtok();
				if(!first){
					s.pb(Ins(Offset,sizes[dim]));
					dim++;
				}
				else first=false;
			}
			s.pb(GetAddress);
			break;
		}
		case TOK_LPR:{
			int cnt;
			readtok(),Concat(s,args(TOK_RPR,cnt)),readtok();
			s.pb(Ins(Call,cnt));break;
		}
		case TOK_ASS:{
			readtok();
			Ins ins=s.back();s.pop_back();
			switch(ins.type){
				case GetLocal:ins.type=SetLocal;break;
				case GetGlb:ins.type=SetGlb;break;
				case GetAddress:ins.type=SetAddress;break;
			}
			Concat(s,expr(rbp+1)),s.pb(ins);
			break;
		}
		default:return s;
	}
	}
	#undef PF
	return s;
}
#undef cur

Codeset block(){
	Codeset s;
	if(scopes.size())scopes.back().pb(LocalScope());
	readtok(); // {
	while(tok.type!=TOK_RBR)Concat(s,stmt());
	readtok(); // }
	if(scopes.size())scopes.back().pop_back();
	return s;
}

Codeset if_stmt(){
	Codeset s;
	readtok(); // if / elseif
	Concat(s,expr(0));
	Codeset if_branch=stmt();
	Codeset else_branch=Codeset();
	if(tok.type==TOK_ELSE)readtok(),else_branch=stmt();
	if_branch.pb(Ins(Jump,(int)else_branch.size()));
	s.pb(Ins(JumpIfFalse,(int)if_branch.size()));
	Concat(s,if_branch);
	Concat(s,else_branch);
	return s;
}

Codeset while_stmt(){
	Codeset s;
	readtok();
	Concat(s,expr(0));
	Codeset body=stmt();
	body.pb(Ins(Loop,0));
	s.pb(Ins(JumpIfFalse,(int)body.size()));
	Concat(s,body);
	s.back().op1=(int)s.size();
	return s;
}

void parse_function(const string&fnName){
	readtok(); // (
	int fnId=fnPool.size();
	if(fnName=="main")mainFnId=fnId;
	fnPool.pb(Fn());
	funcScope[fnName]=fnId;
	
	scopes.pb(Scope()); // new scope
	scopes.back().pb(LocalScope());
	usedLocalCount.pb(0);
	arrayVars.pb(ArrVar()); // new array scope
	
	while(tok.type!=TOK_RPR){ // )
		readtok(); // int
		string id=readtok().val;
		int varId=VarIdInScope(id); // register args as local vars
		if(tok.type==TOK_COMMA)readtok(); // ,
	}
	readtok(); // )
	
	fnPool[fnId].instr=block();
	fnPool[fnId].instr.pb(Ins(PushInt,0));
	fnPool[fnId].instr.pb(Ins(Return));
	
	int localCnt=usedLocalCount.back();
	fnPool[fnId].localCount=localCnt;
	scopes.back().pop_back();
	scopes.pop_back();
	arrayVars.pop_back();
	usedLocalCount.pop_back();
}

Codeset var_decl(){
	readtok(); // int
	string id1=readtok().val; // name1 
	if(tok.type==TOK_LPR){ // func decl
		parse_function(id1);
		return Codeset();
	}
	tokpos--;
	Codeset s;
	while(1){
		string id=readtok().val;
//		cout<<"VarDecl: "<<id<<endl;
		int varId=scopes.size()==0?GlobalVarId(id):VarIdInScope(id);
		vector<int> sizes;
		int arrSize=1;
		while(tok.type==TOK_LBK){ // [
			readtok();
			int dimSize=1;
			sizes.pb(dimSize=atol(readtok().val.c_str()));
			readtok(); // ]
			arrSize*=dimSize;
		}
		if(sizes.size()){
			int arrId=sizesTable.size();
			(arrayVars.size()?arrayVars.back():globalArrayVars)[varId]=arrId;
			sizes.pb(1);
			for(int i=sizes.size()-2;i>=0;i--)sizes[i]*=sizes[i+1];
			sizesTable.pb(sizes);
			s.pb(Ins(Allocate,arrSize));
			s.pb(Ins(scopes.size()==0?SetGlb:SetLocal,varId));
			s.pb(Ins(PopStack));
		}
		else{
			s.pb(Ins(PushInt,0));
			s.pb(Ins(scopes.size()==0?SetGlb:SetLocal,varId));
			s.pb(Ins(PopStack));
		}
		
		if(tok.type==TOK_COMMA)readtok();
		else break; 
	}
	return s;
}

Codeset ForStmt(){
	readtok(); // for
	readtok(); // (
	
	Codeset s,init,cond,step;
//	cout<<tok.val<<" as init"<<endl;
	init=stmt();
//	cout<<"After init, it is "<<tok.val<<endl;
	if(
		tok.type==TOK_SEMICOL
		&&
		tokens[tokpos-1].type!=TOK_SEMICOL
	)readtok(); // ;
	
//	cout<<tok.val<<" as cond"<<endl;
	cond=expr(0);
	if(cond.size()==0){
		cond.pb(Ins(PushInt,1));
//		puts("Empty Cond."); 
	}
	if(tok.type==TOK_SEMICOL)readtok(); // ;
	
//	cout<<tok.val<<" as step"<<endl;
	step=expr(0);
	
	readtok(); //)
	
	Concat(s,init);
	
	Codeset body=stmt();
	Concat(body,step);
	body.pb(Ins(Loop,0));
	
	Codeset t;
	Concat(t,cond);
	t.pb(Ins(JumpIfFalse,(int)body.size()));
	Concat(t,body);
	t.back().op1=(int)t.size();
	
	Concat(s,t);
	return s; 
}

Codeset CoutStmt(){
	readtok(); // cout
	Codeset s;
	while(tok.type==TOK_LSHF){
		readtok(); // <<
		if(tok.type==TOK_ENDL){
			readtok(); // endl
			s.pb(Ins(CoutEndl));
		}
		else{
			Concat(s,expr(0));
			s.pb(Ins(Cout));
		}
	}
	return s;
}

Codeset CinStmt(){
	readtok(); // cin
	Codeset s;
	while(tok.type==TOK_RSHF){
		readtok(); // >>
		Codeset block=expr(0);
		switch(block.back().type){
			case GetGlb: block.back().type=SetGlb; break;
			case GetLocal: block.back().type=SetLocal; break;
			case GetAddress: block.back().type=SetAddress; break;
		}
		Ins ins=block.back(); block.pop_back();
		Concat(s,block);
		s.pb(Ins(Cin));
		s.pb(ins);
	}
	return s;
}

Codeset stmt(){
	Codeset s;
//	cout<<"Stmt: "<<tok.val<<endl;
	switch(tok.type){
		case TOK_IF:Concat(s,if_stmt());break;
		case TOK_WHILE:Concat(s,while_stmt());break;
		case TOK_FOR:Concat(s,ForStmt());break;
		case TOK_INT:Concat(s,var_decl());if(tok.type==TOK_SEMICOL)readtok();break;
		case TOK_LBR:Concat(s,block());break;
		case TOK_RETURN:{
			readtok();
			if(tok.type!=TOK_RBR){
				Concat(s,expr(0));
			}
			s.pb(Ins(Return));
			if(tok.type==TOK_SEMICOL)readtok();
			break;
		}
		case TOK_COUT:Concat(s,CoutStmt());if(tok.type==TOK_SEMICOL)readtok();break;
		case TOK_CIN:Concat(s,CinStmt());if(tok.type==TOK_SEMICOL)readtok();break;
		case TOK_SEMICOL:readtok();break;
		default:Concat(s,expr(0)),s.pb(Ins(PopStack));if(tok.type==TOK_SEMICOL)readtok();break;
	}
//	for(auto a:s)cout<<a.type<<' '<<a.op1<<endl;
//	cout<<"==="<<endl;
	return s;
}

Int* global;
Int* runstack;
IntPtr esp;
vector<Int> inputs;

Int CallFn(Int fnId,int argc);

void* GenerateTable(const vector<int>&sizes,int dim=0){
	if(dim==sizes.size()-1){
		Int* arr=new Int[sizes[dim]];
		memset(arr,0,sizeof(Int)*sizes[dim]);
		return (void*)arr;
	}
	else{
		void*** arr=new void**[sizes[dim]];
		for(int i=0;i<sizes[dim];i++)arr[i]=(void**)GenerateTable(sizes,dim+1);
		return (void*)arr;
	}
}
Int Execute(const Codeset&s,IntPtr ebp){
	#define LocalVar(x) *(ebp+(x))
	#define GlobalVar(x) *(global+(x))
	#define Push(v) 	(*(++esp)=(v))
	#define Top(v) 		(*esp)
	#define Pop() 		(esp--)
	#define ToArr(x)	((int*)(x))
	
	unsigned ip=0;
	Int retValue=0;
	while(true){
		if(ip>=s.size())break;
		const Ins&ins=s[ip];
//		cout<<ip<<": "<<insTypeStrings[ins.type]<<" "<<ins.op1<<endl;
//		Sleep(10); 
		switch(ins.type){
			default:printf("Unknown Instruction at ip=%lld, type=0x%02x\n",ip,ins.type);while(1);break;
			
			case Add:{ Int rv=Top(); Pop(); Top()+=rv; break;}
			case Sub:{ Int rv=Top(); Pop(); Top()-=rv; break;}
			case Mul:{ Int rv=Top(); Pop(); Top()*=rv; break;}
			case Div:{ Int rv=Top(); Pop(); Top()/=rv; break;}
			case Mod:{ Int rv=Top(); Pop(); Top()%=rv; break;}
			case Xor:{ Int rv=Top(); Pop(); Top()=(Top()?1:0)^(rv?1:0); break;}
			case LogicAnd:{ Int rv=Top(); Pop(); Top()=Top()&&rv; break;}
			case LogicOr:{ Int rv=Top(); Pop(); Top()=Top()||rv; break;}
			
			case Eql:{ Int rv=Top(); Pop(); Top()=Top()==rv; break;}
			case NotEql:{ Int rv=Top(); Pop(); Top()=Top()!=rv; break;}
			case Sml:{ Int rv=Top(); Pop(); Top()=Top()<rv; break;}
			case SmlEql:{ Int rv=Top(); Pop(); Top()=Top()<=rv; break;}
			case Big:{ Int rv=Top(); Pop(); Top()=Top()>rv; break;}
			case BigEql:{ Int rv=Top(); Pop(); Top()=Top()>=rv; break;}
			
			case Not:{ Top()=!Top(); break;}
			case Positive:{ Top()=+Top(); break;}
			case Negative:{ Top()=-Top(); break;}
			
			case PushInt:{ Push(ins.op1); break;}
			case PopStack:{ Pop(); break;}
			case PushFn:{ Push(ins.op1); break;}
			case Allocate: { Push((Int)(new Int[ins.op1])); memset(ToArr(Top()),0,sizeof(Int)*ins.op1); break;}
			case Offset:{ Int offset=Top(); Pop(); Top()=Top()*ins.op1+offset; break;}
			
			case GetLocal:{ Push(LocalVar(ins.op1)); break;}
			case SetLocal:{ LocalVar(ins.op1)=Top(); break;}
			case GetGlb:{ Push(GlobalVar(ins.op1)); break;}
			case SetGlb:{ GlobalVar(ins.op1)=Top(); break;}
			case GetAddress:{ Int offset=Top(); Pop(); Top()=ToArr(Top())[offset]; break;}
			case SetAddress:{ Int value=Top(); Pop(); Int offset=Top(); Pop(); ToArr(Top())[offset]=value; Top()=value; break;}
			
			case Jump:{ ip+=ins.op1; break;}
			case JumpIfFalse:{ Int flag=Top(); Pop(); if(!flag)ip+=ins.op1; break;}
			case Loop:{ ip-=ins.op1; break;}
			
			case Cin:{ Int x=inputs.back(); inputs.pop_back(); Push(x); break;}
			case Cout:{ cout<<Top(); Pop(); break;}
			case CoutEndl:{ cout<<endl; break;}
			case Putchar:{ putchar(Top()); break;}
			case Getchar:{ Push((Int)getchar()); break;}
			
			case Call:{
				IntPtr oldEsp=esp;
				Int fnId=*(esp-ins.op1);
				Int ret=CallFn(fnId,ins.op1);
				esp=oldEsp-ins.op1;
				Top()=ret;
				break;
			}
			case Return:{ return Top();}
		}
		ip++;
	}
	return 0;
}

Int CallFn(Int fnId,int argc){
//	cout<<"Calling "<<fnId<<endl;
	Fn& fn=fnPool[fnId];
	IntPtr ebp=esp-argc+1;
	esp=fn.localCount+ebp;
	for(auto a=ebp+argc;a<esp;a++)*a=0;
	return Execute(fn.instr,ebp); 
}

int main(){
//	freopen("future-input.cpp","r",stdin);
	Int n=2; while(n--){
		Int x; cin>>x; inputs.pb(x);
	}
	reverse(inputs.begin(),inputs.end());
	string t="
#include<iostream>
#include<cstdio>
using namespace std;
int main()
{int a, b; cin >> a >> b; cout << a + b << endl;}"
	tokens.pb({"{",TOK_LBR});
	tokenize(t);
	tokens.pb({(string)"}",TOK_RBR});
	Codeset preMain=stmt();
//	cout<<"Compile done"<<endl;
	global=new Int[globalScope.size()];
	runstack=new Int[1024*1024];
	esp=runstack;
//	cout<<"Ready execute"<<endl;
	Execute(preMain,runstack);
	CallFn(mainFnId,0);
}