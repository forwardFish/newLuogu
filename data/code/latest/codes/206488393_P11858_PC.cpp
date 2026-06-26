#include <cstdio>
#include <cctype>
#include <cstdlib>
#include <cstring>

struct Block {
    char ch;
    long long count;
};

Block blocks[100000]; 
int block_count = 0;

int main() {
    char s_prime[100002];
    fgets(s_prime, sizeof(s_prime), stdin);
    int len = strlen(s_prime);
    if (len > 0 && s_prime[len-1] == '\n') {
        s_prime[len-1] = '\0'; 
    }
    
    long long c;
    if (scanf("%lld", &c) != 1) {
        return 1;
    }

    int i = 0;
    while (s_prime[i] != '\0') {
        char ch = s_prime[i];
        i++;
        
        char num_str[20] = {0};
        int num_len = 0;
        while (s_prime[i] != '\0' && isdigit(s_prime[i])) {
            if (num_len < 19) num_str[num_len++] = s_prime[i];
            i++;
        }
        num_str[num_len] = '\0';
        
        long long cnt = strtoll(num_str, NULL, 10);
        blocks[block_count].ch = ch;
        blocks[block_count].count = cnt;
        block_count++;
    }
    long long total = 0;
    for (int j = 0; j < block_count; ++j) {
        total += blocks[j].count;
    }
    long long k = c % total;
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