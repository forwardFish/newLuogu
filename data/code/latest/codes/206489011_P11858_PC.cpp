#include <cstdio>
#include <cctype>
#include <cstdlib>
#include <cstring>

struct Block {
    char ch;
    long long count;
};

#define MAX_BLOCKS 200000 
Block blocks[MAX_BLOCKS];
int block_count = 0;

int main() {
    char s_prime[100002];
    if (!fgets(s_prime, sizeof(s_prime), stdin)) return 1;
    
    int len = strlen(s_prime);
    while (len > 0 && (s_prime[len-1] == '\n' || s_prime[len-1] == '\r')) {
        s_prime[--len] = '\0';
    }
    
    long long c;
    if (scanf("%lld", &c) != 1) return 1;
    
    int i = 0;
    while (s_prime[i] != '\0') {
        if (block_count >= MAX_BLOCKS) return 1;
        
        if (!isalpha(s_prime[i])) return 1;
        char ch = s_prime[i++];
    
        char num_str[21] = {0}; 
        int num_len = 0;
        while (s_prime[i] != '\0' && isdigit(s_prime[i]) && num_len < 20) {
            num_str[num_len++] = s_prime[i++];
        }
        if (num_len == 0) return 1; 
        
        long long cnt = strtoll(num_str, NULL, 10);
        if (cnt <= 0) return 1;
        
        blocks[block_count++] = {ch, cnt};
    }

    long long total = 0;
    for (int j = 0; j < block_count; ++j) {
        total += blocks[j].count;
        if (total > 1e18) break; 
    }
    
    long long k = total ? c % total : 0;
    long long current = 0;
    for (int j = 0; j < block_count; ++j) {
        if (k < current + blocks[j].count) {
            printf("%c\n", blocks[j].ch);
            return 0;
        }
        current += blocks[j].count;
    }
    
    return 1;
}