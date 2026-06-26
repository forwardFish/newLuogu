#include <cstdio>
#include <cctype>
#include <cstdlib>

struct Block {
    char ch;
    long long count;
};

Block blocks[100000];
int block_count = 0;

int main() {
    char s_prime[100001]; 
    long long c;
    scanf("%100000s %lld", s_prime, &c);
    
    int i = 0;
    while (s_prime[i] != '\0') {
        char ch = s_prime[i];
        i++; 
        
        char num_str[20] = {0};
        int num_len = 0;
        while (s_prime[i] != '\0' && isdigit(s_prime[i])) {
            if (num_len < 19) { 
                num_str[num_len++] = s_prime[i];
            }
            i++;
        }
        num_str[num_len] = '\0'; 
        
        long long cnt = strtoll(num_str, NULL, 10);
        blocks[block_count].ch = ch;
        blocks[block_count].count = cnt > 0 ? cnt : 0; 
        block_count++;
    }
    
    long long total = 0;
    for (int j = 0; j < block_count; ++j) {
        total += blocks[j].count;
    }
    if (total == 0) {
        printf("\n");
        return 0;
    }
    
    long long k = c % total;
    long long current = 0;
    for (int j = 0; j < block_count; ++j) {
        if (blocks[j].count == 0) continue;
        if (current <= k && k < current + blocks[j].count) {
            printf("%c\n", blocks[j].ch);
            return 0;
        }
        current += blocks[j].count;
    }
    printf("%c\n", blocks[0].ch);
    return 0;
}