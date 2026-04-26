#include <stdio.h>
int main()
{
    int a;
    printf("Enter the Grades:");
    scanf("%d", &a);
if(a>=90)
{  printf("It's A+ Champ");}
else { if(a>=75)
    {printf("A");}
    else {
        if(a>=60)
        {printf("B");}
    else {
        if(a>=40)
        {printf("C");}
        else {
        if(a<40)
        {printf("FAIL");}
    }}}}}
 
