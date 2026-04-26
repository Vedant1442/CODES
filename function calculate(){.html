function calculate(){
let total=0;
gradeData=[];
subjects.forEach(([s,c,t])=>{
let m=round(+document.getElementById(s).value||0);
let g=
t==="theory"?gTheory(m):
t==="lab"?gLab(m):
t==="mfrlab"?gMFRLab(m):
t==="cppslab"?gCPPSLab(m):
t==="lact"?gLACT(m):
t==="iks"?gIKS(m):
gCCA(m);
gradeData.push({subject:s,marks:m,grade:g,credits:c,points:g*c});
total+=g*c;
});
cgpaVal.innerText="CGPA: "+(total/20).toFixed(2);
drawCharts();
result.style.display="block";
result.scrollIntoView({behavior:"smooth"});
}

/* ===== CHARTS ===== */
function drawCharts(){
let p=pie.getContext("2d"),b=bar.getContext("2d");
p.clearRect(0,0,420,320);
let sum=gradeData.reduce((a,b)=>a+b.grade,0),a=0;
gradeData.forEach((d,i)=>{
let ang=(d.grade/sum)*Math.PI*2;
p.beginPath();p.moveTo(210,160);
p.arc(210,160,120,a,a+ang);
p.closePath();
p.fillStyle=`hsl(${i*28},70%,55%)`;
p.fill();p.strokeStyle="#fff";p.stroke();
a+=ang;
});
b.clearRect(0,0,900,280);
gradeData.forEach((d,i)=>{
b.fillStyle="#38bdf8";
b.fillRect(30+i*65,240-d.grade*18,35,d.grade*18);
b.fillStyle="#fff";
b.fillText(d.subject,30+i*65,260);
});
}

/* ===== PDF ===== */
const { jsPDF } = window.jspdf;
function exportPDF(){
const doc=new jsPDF();
const name=studentName.value||"Student";
doc.text(`${name} – Academic Report`,105,15,{align:"center"});
doc.text(cgpaVal.innerText,14,30);
let y=40;
doc.text("Subject-wise Academic Breakdown:",14,y);y+=8;
gradeData.forEach(d=>{
doc.text(
${d.subject} | Marks:${d.marks} | Grade:${d.grade} | Credits:${d.credits} | Points:${d.points},
14,y
);
y+=6;
});
doc.addImage(pie.toDataURL(),"PNG",14,y+10,80,60);
doc.addImage(bar.toDataURL(),"PNG",110,y+10,80,60);
doc.setFontSize(28);
doc.setTextColor(200);
doc.text("Mohit Narkhede",105,180,{align:"center",angle:45});
doc.save(${name}_Academic_Report.pdf);
}
</script>

</body>
</html>