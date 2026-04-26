#include <stdio.h>
int main()
{
int a;
char response;
    printf("Enter the Age:");
    scanf("%d", &a);
    printf("Is citizen Bhartiya?:");
    scanf(" %c", &response);
if(a>18 && (response == 'y' || response == 'Y'))
{
    printf("The person is eligible to vote");
}
else {
   printf("The person is not eligible to vote");
}
 return 0;
}