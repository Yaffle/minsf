// С параллельной обработкой координат
// Класс кубов и Набора кубов
// перед использованием создать
// var gl = new cubeglobals(varscount1);
// переменных <=31 !!!

function cubeglobals(varscount1){
  this.varscount = varscount1;
  this.x=2;
  this.y=3;
  this.z=4;
  this.e=5;
  this.asterisk     = [[0,3,0],
                       [3,1,1],
                       [0,1,2]];
  this.intersection = [[0,5,0],
                       [5,1,1],
                       [0,1,2]];
  this.subtraction  = new Array(new Array(4,3,4),new Array(3,4,4),new Array(1,0,4));
  return this;
}

var gl = new cubeglobals(0);

function cube(n){
  if(n == -1){
    this.n = 0;
  }else{
    this.n = 0;
    var a=0;
    for(var i=0;i<gl.varscount;i++){
      a = (a << 1) + n%2;
      n = Math.floor(n / 2);
    }
    n = a;
    for(var i=0;i<gl.varscount;i++){
      this.n = (this.n << 2) + (1+n%2);
      n = Math.floor(n / 2);
    }
  }
  this.mark	= '';		//'*'-в ядре,'>'-отличающая единица,'>>'-единица накрылась ядром

  return this;
}

  cube.prototype.aster    	= cube_aster;	//*
  cube.prototype.inter    	= cube_inter;	//^
  cube.prototype.subtr    	= cube_subtr;	//#
  cube.prototype.issub    	= cube_issub;	//<
  cube.prototype.isequal	= cube_isequal;	//=
  cube.prototype.dimen		= cube_dimen;	//размерность
  cube.prototype.cost		= cube_cost;	//цена(длина)
  cube.prototype.less		= cube_less;	//меньше - для сортировки

  cube.prototype.tocube   	= cube_tocube;
  cube.prototype.toconj   	= cube_toconj;

function cube_aster(b){
  var c = this.n | b.n;
  var x = (c & 1431655765) & ((c & 2863311530) >>> 1);
  if( (x-1) & x )
    return -1;
  var r = new cube(-1);
  r.n = c & ~(x | (x << 1));
  return r;
}

function cube_inter(b){
  var c = this.n | b.n;
  var x = (c & 1431655765) & ((c & 2863311530) >>> 1);
  if(x)
    return -1;
  var r = new cube(-1);
  r.n = c;
  return r;
}

function cube_subtr(b){ // возвращается набор
  var rset = new cubesset();

  var c = this.n | b.n;
  var x = (c & 1431655765) & ((c & 2863311530) >>> 1);
  if(x){
    rset.a.push(this);
    return rset;
  }

  x = (this.n | (~(b.n)));
  if( (x+1) == 0 )//!
    return rset;

  var i,x1,r2,rn = this.n;
  for(i=0;i<gl.varscount;i++){
    x1 = (x & 3);
    x >>>= 2;
    if(x1 != 3){
      r2 = new cube(-1);
      r2.n = rn | (x1 << (i*2) );
      rset.a.push( r2 );
    }
  }
  return rset;
}

function cube_issub(b){
  var c = this.n | b.n;
  var x = (c & 1431655765) & ((c & 2863311530) >>> 1);
  if(x)
    return false;
  x = (this.n | (~(b.n)));
  if( (x+1) == 0 )//!
    return true;
  return false;
}

function cube_isequal(b){
  return (this.n == b.n);
}

function cube_dimen(){
  var d=0;
  var x=this.n;
  for(var i=0;i<gl.varscount;i++){
    if( (x & 3) == 0)
      d++;
    x >>>= 2;
  }
  return d;
}

function cube_cost(){
  return gl.varscount-this.dimen();
}

function cube_less(b){	// сортируем кубы. 0<1<x
  return (this.n < b.n);
}

function cube_tocube(){ // только 0,1,x
  var s="";
  var x;
  for(var i=gl.varscount-1;i>=0;i--){
    x = ((this.n >>> i*2) & 3);
    s+= (x==0?'x':x >>> 1);
  }
  return s;
}

// составляем повернутое число из перевернутых картинок-цифр
function makernum(n){
 var t='';
 while(n>9){
   t += '<img width="24" src="imgs/r'+(n%10)+'.png"><br>';
   n  = (n-n%10)/10;
 }
 t += '<img width="24" src="imgs/r'+(n%10)+'.png"><br>';
 return t;
}

function cube_toconj(rotated){
  var x;
  if(rotated){
	  var t="";
	  var a="uzyx";
	  for(var i=gl.varscount-1;i>=0;i--){
	    x = ((this.n >>> (i*2)) & 3);
	    if(x!=0)
	      if(x==1)
	        t = (gl.varscount>4? '<br>'+makernum(gl.varscount-i)+'<img width="24" src="imgs/rnx.png">' : '<br><img width="24" src="imgs/rn'+a.charAt(i)+'.png">') +t;
	      else
	        t = (gl.varscount>4? '<br>'+makernum(gl.varscount-i)+'<img width="24" src="imgs/rx.png">' : '<br><img width="24" src="imgs/r'+a.charAt(i)+'.png">') + t;
	  }
	  return '<span class="conj">'+(this.mark.replace(/>/g, '&gt;'))+t+'</span>';
  }

  var t="";
  var a="uzyx";
  for(var i=gl.varscount-1;i>=0;i--){
    x = ((this.n >>> i*2) & 3);
    if(x!=0)
      if(x==1)
        t += (gl.varscount>4? '<img width="16" src="imgs/nx.png">'+(gl.varscount-i) : '<img width="16" src="imgs/n'+a.charAt(i)+'.png">');
      else
        t += (gl.varscount>4? '<img width="16" src="imgs/x.png">'+(gl.varscount-i) : '<img width="16" src="imgs/'+a.charAt(i)+'.png">');
  }
  t += '<sup>'+ (this.mark.replace(/>/g, '&gt;')) +'</sup>';
  return '<span class="conj">'+t+'</span>';
}


// cubesset

function cubesset(){
  this.a = new Array();
  return this;
}

  cubesset.prototype.fromstring		= cubesset_fromstring;
  cubesset.prototype.fromvector		= cubesset_fromvector;

  cubesset.prototype.addcube   		= cubesset_addcube;	// добавляем куб, если нет точно такого же
  cubesset.prototype.addcset   		= cubesset_addcset;	// добавляем все кубы из набора, если таких кубов еще нет
  cubesset.prototype.intercube		= cubesset_intercube;	// пересечение с кубом
  cubesset.prototype.intercset		= cubesset_intercset;	// пересечение с набором
  cubesset.prototype.subtrcube		= cubesset_subtrcube;   // вычитаем куб
  cubesset.prototype.subtrcset		= cubesset_subtrcset;   // вычитаем набор

  cubesset.prototype.deletemarks	= cubesset_deletemarks;	// удаляем пометки
  cubesset.prototype.cost		= cubesset_cost; 	// цена определяется как сумма цен входящих кубов cost1+...costn;
  cubesset.prototype.count		= cubesset_count;	// число кубов

  cubesset.prototype.isequal		= cubesset_isequal;	// РАВНЫ, т.е. содержат одни и те же кубы+отсортированы(а не покрывают одни и те же единицы)	
  cubesset.prototype.isempty		= cubesset_isempty; 	// пустое множество
  cubesset.prototype.issubset		= cubesset_issubset;	// покрывается другим набором

  cubesset.prototype.sort		= cubesset_sort;
  cubesset.prototype.tocset		= cubesset_tocset;	// столбик { xyz, xyzu }
  cubesset.prototype.todnf		= cubesset_todnf;	// xyz v xyzu v ...
  cubesset.prototype.todnf2		= cubesset_todnf2;	// xyz , xyzu , ...

  cubesset.prototype.deletesubcubes     = cubesset_deletesubcubes; // если a входит в b, то удаляем a
  cubesset.prototype.markcset		= cubesset_markcset;	// метим те, которые встречаются в другом наборе
  cubesset.prototype.markcset2		= cubesset_markcset2;	// метим те, которых нет в другом наборе и которые еще не помечены
  cubesset.prototype.markall		= cubesset_markall;	// метим все

  cubesset.prototype.ordering		= cubesset_ordering;	

// из строки вида (N1)vN2v...N3
// push1==true => помещаем значения, на которых ф-я определена   (те, что без скобок)
// push0==true => помещаем значиния, на которых ф-я неопределена (те, что в скобках)!
function cubesset_fromstring(st,push1,push0){ 
  st+='v';
  var i=0,f=1,n=0,c,wn=false;
  var sa = "0123456789ABCDEF";
  while(i<st.length){
    c = st.charAt(i);
    if(sa.indexOf(c)>=0){
      n=n*16+parseInt(st.charAt(i),16);
      wn=true;
    }else{
      if(wn && f==1 && push1)
        this.a.push(new cube(n));
      if(wn && f==0 && push0)
        this.a.push(new cube(n));
      wn=false;
      n=0;
      if(c=='(')
        f=0;
      if(c==')')
        f=1;
    }
    i++;
  }
}

// Если функция задана вектором...
function cubesset_fromvector(st){
  var i=0,n;
  while(i<st.length){
    n = parseInt( st.charAt(i) , 16);
    if((n >> 3)%2==1) this.a.push(new cube(i*4));
    if((n >> 2)%2==1) this.a.push(new cube(i*4+1));
    if((n >> 1)%2==1) this.a.push(new cube(i*4+2));
    if((n >> 0)%2==1) this.a.push(new cube(i*4+3));
    i++;
  }
}

function cubesset_addcube(c){
  for(var i=0;i<this.a.length;i++)
    if(this.a[i].isequal(c))
      return;
  this.a.push(c);
}

function cubesset_addcset(cset){
  for(var i=0;i<cset.a.length;i++)
    this.addcube(cset.a[i]);
}

function cubesset_intercube(c){	
  var r=new cubesset();
  for(var i=0;i<this.a.length;i++)
    if(this.a[i].inter(c)!=-1)
      r.addcube( this.a[i].inter(c) );
  return r;
}

function cubesset_intercset(cset){
  var r=new cubesset();
  for(var i=0;i<cset.a.length;i++)
    r.addcset( this.intercube(cset.a[i]) );
  return r;
}

function cubesset_subtrcube(cube){
  var ns = new cubesset();
  for(var i=0;i<this.a.length;i++)
    ns.addcset( this.a[i].subtr(cube) );
  return ns;
}

function cubesset_subtrcset(cset){
  var ns = this;
  for(var i=0;i<cset.a.length;i++)
    ns = ns.subtrcube(cset.a[i]);
  return ns;
}

function cubesset_deletemarks(){
  for(var i=0;i<this.a.length;i++)
    this.a[i].mark='';
}

function cubesset_cost(){
  var n=0;
  for(var i=0;i<this.a.length;i++)
    n+= this.a[i].cost();
  return n;
}

function cubesset_count(){
  return this.a.length;
}

function cubesset_isequal(cset){
  if(this.a.length!=cset.a.length)
    return false;
  for(var i=0;i<this.a.length;i++)
    if(!this.a[i].isequal(cset.a[i]))
      return false;
  return true;
}

function cubesset_isempty(){
  return this.a.length==0;
}

function cubesset_issubset(cset){
  return this.subtrcset(cset).isempty();
}

function cubesset_sort(){
  var i,j,t;
  for(i=0;i<this.a.length;i++)
    for(j=i+1;j<this.a.length;j++)
      if( this.a[j].less(this.a[i]) ){
        t = this.a[i];
        this.a[i] = this.a[j];
        this.a[j] = t;
      }
}

function cubesset_tocset(tocolumn,showbraces){ 
  if(this.a.length==0) 
    return "&#216;";//пустое множество!
  var r='';
  if(tocolumn){
    r='<table cellpadding=0 cellspacing=0 class="cset" style="display: inline-table;"><tr>'+(showbraces?'<td><img src="imgs/lbrace.png" width=8></td>':'') +'<td>'+this.a[0].tocube();
    if(this.a.length>8){ //выводим по 3 штуки в ряд, чтобы сократить длиннющие столбцы
      for(var i=1;i<this.a.length;i++)
        r+= (i%3==0?'<br>':', ')+this.a[i].tocube();
    }else{
      for(var i=1;i<this.a.length;i++)
        r+='<br>'+this.a[i].tocube();
    }
    r+='</td>'+(showbraces?'<td><img src="imgs/rbrace.png" width=8></td>':'')+'</tr></table>';
  }else{
    r=(showbraces?'{ ':'')+this.a[0].tocube();
    for(var i=1;i<this.a.length;i++)
      r+=' , '+this.a[i].tocube();
    r+=(showbraces?' }':'');
  }
  return r;
}

function cubesset_todnf(showprice){
  var t="";
  for(var i=0;i<this.a.length;i++)
    t+=  (i!=0?' v ':'')+this.a[i].toconj();
  return t+(showprice? ', цена='+this.cost() : '');
}


function cubesset_todnf2(){
  var t="";
  for(var i=0;i<this.a.length;i++)
    t+=  (i!=0?' , ':'')+this.a[i].toconj();
  return t;
}

function cubesset_deletesubcubes(){
  var a = new Array();
  var i,j;
  for(i=0;i<this.a.length;i++){
    for(j=0;j<this.a.length;j++){
      if(i!=j)
        if( this.a[i].issub(this.a[j]) )
          break;
    }
    if(j==this.a.length)
      a.push(this.a[i]);
  }
  this.a = a;
}

function cubesset_markall(mark1){
  var i;
  for(i=0;i<this.a.length;i++)
    this.a[i].mark=mark1;
}

function cubesset_markcset(cset,mark1){
  var i,j;
  for(i=0;i<this.a.length;i++)
    for(j=0;j<cset.a.length;j++)
      if( this.a[i].isequal(cset.a[j]) ){
	this.a[i].mark=  mark1;
        break; 
      }
}

function cubesset_markcset2(cset,mark1){
  var i,j,f;
  for(i=0;i<this.a.length;i++)
    if(this.a[i].mark == ''){
      f=1;
      for(j=0;j<cset.a.length;j++)
        if( this.a[i].isequal(cset.a[j]) ){
	  f=0;
          break;
        }
      if(f)
	this.a[i].mark=  mark1;
    }
}

function cubesset_ordering(L){//возвращаем изменился ли набор
  var r = new Array();
  var i,j,f,iinter,jinter,ch=false;
  var x,ra,m,x1;

  Linter= new Array();

  //удаляем те, которые в L ничего не покрывают + заносим все пересечения в массив
  for(i=0;i<this.a.length;i++){
    Linter[i]= L.intercube(this.a[i]);
    if(Linter[i].isempty()){ 
      this.a[i]=-1;
      ch=true;
    }
  }

  for(i=0;i<this.a.length;i++)
    if(this.a[i]!=-1){
      iinter = Linter[i];
      for(j=0;j<this.a.length;j++)
        if(i!=j && this.a[j]!=-1){
          f= this.a[j].cost()-this.a[i].cost();
          if(f<0) continue;
          jinter = Linter[j];
          if(f>=0 && jinter.issubset(iinter) ){ //! f>=0

/*
						//! если f==0, то МОЯ проверка можно ли исключить v
	    if(f==0){
              ra = L.intercset(this.a[i].subtr(this.a[j]));

              for(m=0;m<this.a.length;m++)
                if(m!=i && m!=j && this.a[m]!=-1)
                  if( !Linter[m].issubset(iinter) ){
                    ra = ra.subtr( this.a[m] );
		    if(ra.isempty())
                      break;
                  }
      
              if( !ra.isempty() ){
 	          this.a[j]=-1;
  	          ch=true;
              }
            }
*/
//	    if(f>0 || iinter.a.length>jinter.a.length){ //или цена больше, или покрывает больше, а цена одинаковая
//	    if(f>0){ //или цена больше, или покрывает больше, а цена одинаковая
 	      this.a[j]=-1;
	      ch=true;
//            }
          }
        }
    }
  for(i=0;i<this.a.length;i++)
    if(this.a[i]!=-1)
      r.push(this.a[i]);
  this.a=r;
  return ch;
}

