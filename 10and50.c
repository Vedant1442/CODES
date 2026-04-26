#include <stdio.h>
int main()
{
int a;
    printf("Enter the Number:");
    scanf("%d", &a);
if(a>10 && a<50)
{
    printf("The number is between 10 and 50");
}
else {
   printf("The number is not between 10 and 50");
}
 return 0;
}