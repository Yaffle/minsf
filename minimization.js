var mylink = "http://www.google.com/search?q=минимизация+переключательных+функций";
var mylink2 = location.href;
var OPERA = navigator.appName.indexOf("Opera")>-1;


//----------------------------------------------------------------------------------------------------------

function minimization(){

	this.getminimization    = minimization_getminimization;
	this.getanalyse 	= minimization_getanalyse;
	this.getall 		= minimization_getall;

	this.D = new cubesset();
	this.L = new cubesset();
	this.K = new cubesset();
	this.MDNF = [];//массив массивов из ДНФ
	this.MDNFcost = new Array(-1,-1,-1); //массив цен для каждого метода
	this.havebracning=1;
	this.first=1;

	this.getcontents 	= minimization_getcontents;
	this.getpart1   	= minimization_getpart1;
	this.getpart2   	= minimization_getpart2;
	this.getpart21  	= minimization_getpart21;
	this.getpart22  	= minimization_getpart22;
	this.getpart23  	= minimization_getpart23;
	this.getpart24  	= minimization_getpart24;
	this.getpart3    	= minimization_getpart3;
	this.getliteraturelist  = minimization_getliteraturelist;

	this.getDLK  		= minimization_getDLK;
	this.gettruthtable	= minimization_gettruthtable;
	this.findZ		= minimization_findZ;
	this.extraction		= minimization_extraction;

	return this;
}


function getvarsc(st){
  st+='v';
  var i=0,f=1,n=0,c,wn=false,mn=0;
  var sa = "0123456789ABCDEF";
  while(i<st.length){
    c = st.charAt(i);
    if(sa.indexOf(c)>=0){
      n=n*16+parseInt(st.charAt(i),16);
      wn=true;
    }else{
      if(wn && f==1)
        if(mn<n) mn = n;
      if(wn && f==0)
        if(mn<n) mn = n;
      wn=false;
      n=0;
      if(c=='(')
        f=0;
      if(c==')')
        f=1;
    }
    i++;
  }
  //  mn - максимальное число...
  //  mn < 2^n  =>  n = log2 (m)] окр. вверх
  return Math.ceil(Math.log(mn)/Math.log(2));
}

function minimization_getDLK(st,det){
	this.D = new cubesset();
	this.L = new cubesset();
	this.K = new cubesset();
	this.TDNF = new Array();

	var isvector = st.indexOf('v')==-1;//=> вектор
	if(isvector){
		gl.varscount = Math.round(Math.log(st.length*4)/Math.log(2));
		this.L.fromvector(st);
		this.K.addcset(this.L);
	}else{
		gl.varscount = getvarsc(st);
		this.D.fromstring(st,0,1);
    		this.L.fromstring(st,1,0);
    		if(det==0)
      			this.D=new cubesset();
    		if(det==1){
      			this.L.addcset(this.D);
      			this.D=new cubesset();
    		}
    		this.K.addcset(this.D);
    		this.K.addcset(this.L);
  	}
  	this.K.sort();
  	this.D.sort();
	this.L.sort();
}

function minimization_gettruthtable(st){
  // на которых не опр - ?
  this.getDLK(st,-1);
  var n = Math.pow(2,gl.varscount);
  var c = new cube( n-1 );

  var html= '<table align="center" class="truth" cellspacing="0"><caption>Таблица истинности исходной функции</caption>';
  html += '<thead><tr><th class="top">Набор</th><th class="top" style="width: 48px;" rowspan="2">Значение исходной функции</th><th class="top">Набор</th><th class="top" style="width: 48px;" rowspan="2">Значение исходной функции</th></tr><tr><th class="top">'+c.toconj()+'</th><th class="top">'+c.toconj() + '</th></tr></thead>';

  var n = n/2;
  for(var j=0;j<n;j++){
    html+= '<tr>';

    c = new cube(j);
    html+='<td>'+c.tocube()+'</td>';
    if(!this.L.intercube(c).isempty())
      html+='<td>1</td>';
    else
      if(!this.D.intercube(c).isempty())
        html+='<td>?</td>';
      else
        html+='<td>0</td>';

    c = new cube(j+n);
    html+='<td>'+c.tocube()+'</td>';
    if(!this.L.intercube(c).isempty())
      html+='<td>1</td>';
    else
      if(!this.D.intercube(c).isempty())
        html+='<td>?</td>';
      else
        html+='<td>0</td>';
    html += '</tr>';
  }

  html += '</table>';
  return html;
}


function minimization_getminimization(st,det,method){
  this.st = st;
  this.getDLK(st,det);

  var a    = this.findZ(method);				//1
  var Z    = a[0];
  var html = a[1];

  this.MDNF[method] = new Array();
  this.MDNFcost[method] = -1;
  this.havebranching=0;

  this.first = 1;
  a      = this.extraction(Z,this.L,new cubesset(),method,0);		//2

  html += '<H3>Нахождение тупиковых форм.</H3>'+
          (method==0?'<p>Обозначения:<UL><LI>Единицы ДНФ, покрываемые импликантами СкДНФ, обозначаются "+".Импликанты, попадающие в ядро помечаются "*".</LI><LI>Единицы функции, которые покрываются только какой-то одной импликантой из системы простых импликант, помечаются “>”.</LI><LI>Единицы функции, покрываемые ядром, но не покрываемые только какой-то одной импликантой из системы простых импликант, помечаются “>>”.</UL>' : '')+
          (method==1?'<p>Обозначения:' +
                     '<table>' + 
                     '<tr><td><img src="imgs/ker.png"></td><td>Клетки, покрываемые ядром</td></tr>' + 
                     '<tr><td><img src="imgs/exker.png"></td><td>Клетки, которые покрываются только одной компактной группой наибольшей размерности.</td></tr>' +
                     '<tr><td><img src="imgs/fed.png"></td><td>Клетки, соответствующие единичным наборам функции.</td></tr>' +
                     '</table>' : '')+
          (method==2?'' : '')+
	  a;

  if(this.havebranching==1){
    html += '<H3>Результат:</H3>';
    for(var i=0;i<this.MDNF[method].length;i++)
      html+='МДНФ:'+this.MDNF[method][i].todnf(true)+'<br>';
  }

  return html;
}

function minimization_getanalyse(){
  var t="",i,z,j,c,n=Math.pow(2,gl.varscount);
  var b=new Array('После Квайна','После Карно','После Кубических покрытий');
  var bb=new Array('Результат метода Квайна','Результат метода Карно','Результат метода Кубических покрытий');
  
  // Для начала выведем все получившиеся дизъюнкции с обозначениями f1 f2...
  z=0;
  var tt='<h3 id="3">3. Анализ полученных результатов</h3><p>Все результаты:<br>';

  for(i=0;i<bb.length;i++){
    tt+= '<br><br>'+bb[i];
    for(k=0;k<this.MDNF[i].length;k++){
      tt+= '<br>f<sub>'+(k+i+1)+'</sub>';
      tt+= ' = '+ this.MDNF[i][k].todnf(true);
      z++;
    }
  }

  var tz;
  t = '<table class="valtable" cellpadding=0 cellspacing=0><caption>Общая таблица истинности</caption><tr><td class="top">Набор</td>';
  t+= '<td class="top" width="60">Исходная</td>';
  for(i=0;i<b.length;i++)
    t+= '<td class="top" width="'+60*this.MDNF[i].length+'" colspan="'+this.MDNF[i].length+'">'+b[i]+'</td>';

  c = new cube( Math.pow(2,gl.varscount)-1 );
  t+='<tr>';
  t+='<td class="top">'+c.toconj()+'</td>';
  t+='<td class="top">f<sub>0</sub></td>';
  for(i=0;i<b.length;i++)
    for(k=0;k<this.MDNF[i].length;k++)
      t+= '<td class="top">f<sub>'+(k+i+1)+'</sub></td>';
  t+='</tr>';
  for(j=0;j<n;j++){
    c = new cube(j);
    t+='<tr>';
    t+='<td>'+c.tocube()+'</td>';

    // исходная...
    if(!this.L.intercube(c).isempty()) t+='<td>1</td>';
    else
      if(!this.D.intercube(c).isempty()) t+='<td>?</td>';
      else
        t+='<td>0</td>';

    for(i=0;i<3;i++)
      for(x=0;x<this.MDNF[i].length;x++)
        if(!this.MDNF[i][x].intercube(c).isempty())
          t+= '<td>1</td>';
        else
          t+= '<td>0</td>';
    t += '</tr>';
  }
  t+='</table>';


  var ht= '<h3>АНАЛИЗ</h3>'+
 	'<p>По таблице истинности видно, что минимизация функции проведена верно. '+
	'<p>В результате минимизации получили минимальные дизъюнктивные нормальные формы:'+
	'<OL><LI>Доопределив функцию нулями, методом Квайна получили МДНФ цены '+this.MDNFcost[0]+
	'<LI>Доопределив функцию единицами, методом карт Карно получили МДНФ цены '+this.MDNFcost[1]+
	'<LI>Доопределяя функцию по ходу выполнения алгоритма, методом кубических покрытий получили МДНФ цены '+this.MDNFcost[2]+
	'</OL><p>Метод кубических покрытий приводит к наименьшей МДНФ. Это связано с тем, что минимизируется не полностью определенная функция. В результате минимальная форма принимает на наборах, на которых исходная функция не определена, такие значения, которые соответствуют наиболее оптимальному покрытию. Из всех методов наиболее трудоемким оказывается также метод кубических покрытий, но он удобен для программной реализации минимизации. Наименее трудоемким оказался метод Квайне.';

  return tt+t+ht+'<br>';
}

function minimization_getcontents(){ 
  var html = ''+
	'<H2>Содержание</H2>'+
	'<OL>'+
	'<LI><a href="#1">Постановка задачи</a></LI>'+
	'<LI><a href="#2">Решение задачи</a>'+
    '<OL>'+
    '<LI><a href="#21">Анализ переключательной функции</a></LI>'+
    '<LI><a href="#22">Метод Квайна</a></LI>'+
    '<LI><a href="#23">Карты Карно</a></LI>'+
    '<LI><a href="#24">Кубические покрытия</a></LI>'+
    '</OL></LI>'+
	'<LI><a href="#3">Анализ полученных результатов</a></LI>'+
	'<LI><a href="#4">Список литературы</a></LI>'+
	'</OL>';
  return html;
}

// 1. Постановка задачи
function minimization_getpart1(){
  var ss = '';
  for(var i=0;i<this.st.length;i++)
    if(this.st.charAt(i) == 'v')
      ss += ' v ';
    else
      ss += this.st.charAt(i);
  
  var html = ''+
	'<H2 id="1">1. Постановка задачи</H2>'+
	'<p>Минимизировать переключательную функцию шести аргументов. Функция задана в виде наборов, на которых значения функции равны единице либо не определены. Наборы задаются в шестнадцатеричной системе счисления. В скобках заданы наборы, на которых значение функции не определено:</p>'+
	'<SAMP>y =&gt; ' + ss +' </SAMP>'+
	'<p>Необходимо выполнить следующие задачи:</p>'+
	'<OL>'+
	'<LI>Доопределить функцию нулями, минимизировать полученную функцию методом Квайна;</LI>'+
	'<LI>Доопределить функцию единицами и произвести минимизацию, используя карты Карно;</LI>'+
	'<LI>Минимизировать исходную функцию методом кубических покрытий;</LI>'+
	'<LI>Проанализировать полученные результаты;</LI>'+
	'</OL>';
  return html;
}

// 2. Решение задачи
function minimization_getpart2(){
  var html = '<H2 id="2">2. Решение задачи</H2>';
  return html+this.getpart21()+this.getpart22()+this.getpart23()+this.getpart24();
}

function minimization_getpart21(){
  var ss = '';
  for(var i=0;i<this.st.length;i++)
    if(this.st.charAt(i) == 'v')
      ss += ' v ';
    else
      ss += this.st.charAt(i);

  var html = ''+
 	'<h3 id="21">2.1 Анализ переключательной функции</h3>'+
	'<p>Представим исходную последовательность в виде таблицы истинности.</p>'+
	'<p>Исходная последовательность:</p>'+
	'<SAMP>'+ss+'</SAMP>'+
	this.gettruthtable(this.st)+
	'<p>‘?’ обозначено значение наборов, на которых функция не определена.</p>'+
	'<p>Цена ДНФ является суммой длин всех входящих в нее конъюнкций.</p>';
  return html;
}

function minimization_getpart22(){
  var html = ''+
 	'<h3 id="22">2.2 Минимизация функции методом Квайна.</h3>'+
	'<p>Доопределим функцию нулями, получим конституэнты единицы, затем выполним операции попарного неполного склеивания и элементарного поглощения.</p>'+
        this.getminimization(this.st,0,0);
  return html;
}

function minimization_getpart23(){
  var html = ''+
 	'<h3 id="23">2.3 Минимизация функции методом Карт Карно.</h3>'+
	'<p>Дополним функцию единицами и построим Карты Карно.'+
        this.getminimization(this.st,1,1);
  return html;
}

function minimization_getpart24(){
  var html = ''+
 	'<h3 id="24">2.4 Минимизация функции методом кубических покрытий.</h3>'+
	'<p>Рассмотрим комплекс кубов К(f) = L  D, где L – множество единичных наборов, D – множество наборов, на которых ДНФ не определена.'+
	'<p>Будем выполнять операцию "*" для получения множества простых импликант.'+
        this.getminimization(this.st,-1,2);
  return html;
}

function minimization_getpart3(){
  return this.getanalyse();
}

function minimization_getliteraturelist(){
  var html = ''+
 	'<H2 id="4">4 Список литературы</H2>'+
	'<OL>'+
	'<LI><a target="_blank_" href="'+mylink+'">'+mylink+'</a>'+
	'<LI><a target="_blank_" href="'+mylink2+'">'+mylink2+'</a>'+
//	'<LI>Новиков Ф.А. Дискретная математика для программистов. - Спб, 2000.'+
//	'<LI>Тулин И.А. СХЕМОТЕХНИКА ЮНИТА 1 ОСНОВЫ ТЕОРИИ ЦИФРОВЫХ УСТРОЙСТВ. - МОСКВА, 2002.'+
	'</OL>';
  return html;
}


function minimization_getall(st){ // доопределяем 0 Квайне, 1 Карно, не доопр. Кубич.покр.
  var html= '';
  
  this.st = st;
  html += this.getcontents();
  html += this.getpart1();
  html += this.getpart2();
  html += this.getpart3();
  html += this.getliteraturelist();

  if(document.form111)
    document.form111.text1.value = html;

  return html;
}

//----------------------------------------------------------------------


// Нахождение множества кубов, соответствующих простым импликантам функции
// method==-1 - ничего не выводим, 0 - Квайна, 1-Карно, 2-Кубы
function minimization_findZ(method){
  var Cstep = new cubesset();
  Cstep.addcset(this.K);

  var html = "";
  var step=0;
  
  // 1.
  if(method==2) html += "<table class=simple><tr><td>K(f) = </td><td>"+Cstep.tocset(1,1)+"</td>";

  // 2.
  Cstep.deletesubcubes();

  if(method==2) html += "<td> => C<sub>"+step+"</sub> =></td><td>"+Cstep.tocset(1,1)+'</td></tr></table>';

  // 3 + 4 + 5 + 6.2
  var i,j,dim,d,t1,t2,t3,haveabsorb;
  var Cstep1 = new cubesset();
  var Zstep  = new cubesset();
  var Z      = new cubesset();
  var cu; // для хранения куба...
  var stable = new Array(); // таблица... Сначала пишем в массив, потом строим таблицу
  var absorb = new Array(); // массив флажков - поглащается конъюнкция или нет... или дает ли куб куб большей размерности

  while(!Cstep.isempty()){
    for(i=0;i<Cstep.a.length;i++)
      absorb[i] = 0;
    
    if(method==0) t1='<table cellspacing=0 class="constable"><tr><td class="top">Номера скл.<td class="top">Результат склеивания</td>';
    haveabsorb=0;

    for(i=0;i<Cstep.a.length;i++)
      stable[i] = new Array();

    for(i=0;i<Cstep.a.length;i++){
      dim = Cstep.a[i].dimen();
      for(j=i;j<Cstep.a.length;j++){
        cu= Cstep.a[i].aster(Cstep.a[j]);

        if(method==2){
          stable[i][j]=(i==j?'-':(cu==-1?'&#216;':cu.tocube()));
	  stable[j][i]= stable[i][j];
        }

        if(cu!=-1 && cu.dimen() > dim){
          Cstep1.addcube(cu);// В Cstep1 Помещаем все получившиеся кубы, большей размерности!
          if(method==0) t1+= '<tr><td>'+(i+1)+' - '+(j+1)+'</td><td>'+cu.toconj() + '</td>';
	  haveabsorb=1;
	  absorb[i]=1;
	  absorb[j]=1;
        }
      }
    }

    for(i=0;i<Cstep.a.length;i++)
      if(absorb[i]==0)
        Zstep.a.push(Cstep.a[i]);

    if(method==2) html+= build_cubes_table(Cstep,stable,step);
    if(method==0){
	t1+= '</table>';
        t2 = '<table cellspacing=0 class=constable><tr><td class="top">No</td><td class="top">Эл. Конъюнкция</td><td class="top">Поглощение</td>';
        for(i=0;i<Cstep.a.length;i++)
          t2+='<tr><td>'+(i+1)+'</td><td>'+Cstep.a[i].toconj()+'</td><td>'+(absorb[i]==1?'+': (OPERA?'':'-') ) + '</td></tr>';
	t2+= '</table>';
        if(Zstep.isempty())
          t3 = '<p>На данном шаге все импликанты участвовали в операциях попарного неполного склеивания и были поглощены своими собственными частями. Поэтому простые импликанты на этом шаге не получены.';
        else
  	  t3 = '<p>В результате на данном шаге получаем простые импликанты:<br><SAMP>'+Zstep.todnf2()+'</SAMP>';
        
	html+= '<center><table class="consabstable"><tr><td>'+t2+'</td><td>'+(haveabsorb==1?t1:'')+'</td></tr></table></center>'+t3+'<br>';
    }
    
    if(method==2){
      html += 'Z<sub>'+step+'</sub>='+Zstep.tocset(1,1)+'<br>';
      html += '&#264;<sub>'+(step+1)+'</sub>=C<sub>'+step+'</sub>&cup;(C<sub>'+step+'</sub>*C<sub>'+step+'</sub>)<br>';
     }

    // 6.1
    Cstep1.deletesubcubes();
    if(method==2) html += 'C<sub>'+(step+1)+'</sub>=>'+Cstep1.tocset(1,1)+'<br>';
  
    Z.addcset(Zstep);
    Cstep = Cstep1;
    Zstep  = new cubesset();
    Cstep1 = new cubesset();
    step++;
  }  
  // выводим Z = z0 v Z1 v Z2... <br> Z =>
  if(method==2){
      html+= "Z = Z<sub>0</sub>";
      for(i=1;i<step;i++)
        html+= "&cup;Z<sub>"+i+"</sub>";
      html += '<br>Z=>'+Z.tocset(1,1);
  }
  if(method==0){
      html += '<p>СкДНФ: <br><SAMP>'+Z.todnf()+'</SAMP>';
  }
  if(method==1){
	html='';
	html+=buildkarno(this.K,new cubesset());
	var bb = new Array();
        var n = Math.pow(2,gl.varscount),n1;
	for(i=0;i<=n;i++)
	  bb[i]=0;
	for(i=0;i<Z.a.length;i++){
          n1 = Math.pow(2,Z.a[i].dimen());
          bb[n1]++;
        }
	for(i=n;i>1;i/=2)
          if(bb[i]!=0)
  	    html+= 'Компактных групп размера '+i+' - '+bb[i]+'<br>';
  }
  
  return (new Array(Z,html));
}

//--------------------------------------------------------------------------------------------------------

function doall(st,det,method){ // print1==0 -все, print1==1-Квайна,print1==2-Карно,print1==3-Кубические покр,print1==4-Результаты
  var mm = new minimization();
  if(method<=2)
    return mm.getminimization(st,det,method);
  if(method==3)
    return mm.getanalyse();
  if(method==4)
    return mm.getall(st,det,method);
}

function minimization_extraction(Zstep,L,E,method,startstep){

  var tb,html='';
  var i,j,c,isres=true,step=startstep,cinter,L0,ord1;
  var Zstep1,tmp,Estep,Lstep;

  while(!L.isempty() && isres){
    tmp    = new cubesset();
    Zstep1 = new cubesset();
    Estep  = new cubesset();

    Zstep.deletemarks();
    L.deletemarks();

    if(method==2){
      tb = '<table cellpadding=0 cellspacing=0 class=mintable><caption>Таблица операции вычитания</caption><tr><td class="top">'+(OPERA?"":"<br>")+'</td>';
      for(i=0;i<Zstep.a.length;i++)
        tb += '<td class="top">'+Zstep.a[i].tocube()+'</td>';
      tb+='<td>';
    }


    isres=false;
    // 1. e#(Z-e) //2 
    for(i=0;i<Zstep.a.length;i++){

      if(method==2) 
        tb += '<tr>';
      c = new cubesset();
      c.a.push(Zstep.a[i]);
      if(method==2)
        tb += '<td class="top">'+c.tocset(2);

      for(j=0;j<Zstep.a.length;j++){
        if(i!=j)
          c = c.subtrcube(Zstep.a[j]);
        if(method==2)
          tb += (i==j? '<td>-</td>' : '<td>'+c.tocset(2)+'</td>' );
      }
      if(method==2)
        tb += (c.isempty()? '<td class="formark"></td>' :'<td class="formark">v</td>');

      cinter=c.intercset(L);
      if(!c.isempty() && !cinter.isempty() ){
        Estep.a.push(Zstep.a[i]);
	Zstep.a[i].mark='*';//метим, т.к. включаем в ядро
        L.markcset(cinter,'>');//метим в L те, которые есть в cinter значком '>'
	
      }else
        Zstep1.a.push(Zstep.a[i]);
    }
    if(method==2){
      tb += '</table>';
      html += tb;
    }

    if(method==0) {
      L0 = new cubesset();//для Квайна
      L0.addcset(L);	//для Квайна
    }

    if(method==2) 
      html+="E<sub>"+step+"</sub>:"+Estep.tocset(1,1)+'<br>L<sub>'+(step+1)+'</sub>=L<sub>'+step+'</sub>#E<sub>'+step+'</sub>';
   
    if(method==2){
      tb = '<table cellpadding=0 cellspacing=0 class=mintable><caption>Получение L<sub>'+(step+1)+'</sub>:</caption><tr><td>'+(OPERA?"":"<br>")+'</td>';
      for(i=0;i<Estep.a.length;i++)
        tb += '<td>'+Estep.a[i].tocube()+'</td>';
      tb+='<tr><td>'+L.tocset(2)+'</td>';
    }

    isres = Estep.a.length>0;
    for(i=0;i<Estep.a.length;i++){
      L = L.subtrcube(Estep.a[i]);
      if(method==2)
        tb += '<td>'+L.tocset(2)+'</td>';
      E.a.push(Estep.a[i]);
    }

    if(method==2){
      tb += '</table>';
      if(isres)
        html += tb;
    }

    if(method==0){
      L0.markcset2(L,'>>'); //метим в L0 те, которых нет в L и еще не помечены значком '>>'
      html+=buildtable(Zstep,L0,E);
    }
    E.deletemarks();
    Estep.deletemarks();

    if(method==1){
      if(isres){ 				  //!
        html+= buildkarno(this.L,E); //!
        html+= (this.first? '<br>Ядро: ' : '<br>Псевдоядро: ') +Estep.todnf();
      }
    }

    if(!Estep.isempty() && method==0) html+=(this.first? '<br>Ядро: ' : '<br>Псевдоядро: ')+Estep.todnf();
    if(method==2) html+='L<sub>'+(step+1)+'</sub>:'+L.tocset(1,1)+'<br> <img align=middle class="letter" src="imgs/zc.png"><sub>'+(step+1)+'</sub>=Z<sub>'+step+'</sub>-E<sub>'+step+'</sub>';
    this.first = 0;

    // 3.
    // Для Квайна!
    if(method==0)
      t2 = buildtable(Zstep1,L,E);//построим заранее до упорядочивания, если оно что-то изменит, то выводим две таблицы!
    if(method==2)
      t2 = buildtableforcubes(Zstep1,L,E);//построим заранее до упорядочивания, если оно что-то изменит, то выводим две таблицы!

    ord1  = !L.isempty() && Zstep1.ordering(L);
    isres = ord1 || isres; //?
    if(method==0) html+=(ord1?'<br>До упорядочивания:'+t2+'<br>После упорядочивания:':'')+'<br>';

    if(method==2) html+=(ord1?'<br>До упорядочивания:'+t2+'<br>После упорядочивания:':'')+'<br>'+buildtableforcubes(Zstep1,L,E);
    if(method==2) html+= '<img align=middle class="letter" src="imgs/zc.png"><sub>'+(step+1)+'</sub> => Z<sub>'+(step+1)+'</sub><br>' + 'Z<sub>'+(step+1)+'</sub>:'+Zstep1.tocset(1,1)+'<br>';//?

    Zstep = Zstep1;
    step++;
  }

  if(!L.isempty()){//!!!!!!
    this.havebranching=1;// будем делать перебор...

    var tc = Zstep.a[0];
    Zstep.a.splice(0,1);

    if(method==0)
      tt = buildtable(Zstep,L,E);//для Квайна

    var E2 = new cubesset();
    E2.addcset(E);
    ord1 = Zstep.ordering(L);          //!

//    if(E2.cost() <= this.MDNFcost[method] || this.MDNFcost[method]==-1){-границы!
    if(1){
      if(method==2) html+= '<OL><LI>] куб '+tc.tocube()+' не входит в ТДНФ<br>'+this.extraction(Zstep,L,E2,method,step);//пусть не входит нулевой...
      if(method==0) html+= '<table class="simple" cellpadding=0 cellspacing=0><tr><td style="padding-left: 30px;">] импликанта '+tc.toconj()+' не входит в ТДНФ<br>'+(ord1? 'После исключения импликанты:<br>'+tt+'<br>После упорядочивания:<br>':'')+this.extraction(Zstep,L,E2,method,step);//<hr>
      if(method==1) html+= '<table class="simple" cellpadding=0 cellspacing=0><tr><td style="padding-left: 30px;">] импликанта '+tc.toconj()+' не входит в ТДНФ<br>'+this.extraction(Zstep,L,E2,method,step);//+'<hr>';
      if(method==3) this.extraction(Zstep,L,E2,method,step);
    }

    L=L.subtrcube(tc);
    if(method==0)
      tt = buildtable(Zstep,L,E);//для Квайна
    if(method==2)
      tt ='L\'<sub>'+step+'</sub>: '+L.tocset(1,1)+'<br>';//Выведем L, так как множество изменилось

    ord1 = Zstep.ordering(L);//создавать ли копию Zstep перед первым ordering, или так сойдет?
    E.a.push(tc);//пусть нулевой входит в ядро

//    if(E.cost() <= this.MDNFcost[method]){ -границы!
    if(1){
      if(method==2) html+= '<LI><br>'+tt+'<br>] куб '+tc.tocube()+' входит в ТДНФ<br>'+this.extraction(Zstep,L,E,method,step)+'</OL>';
      if(method==0) html+= '<tr><td style="padding-left: 20px;">] импликанта '+tc.toconj()+' входит в ТДНФ<br>'+(ord1 && !L.isempty() ? 'После включения импликанты:<br>'+tt+'<br>После упорядочивания:<br>':'')+this.extraction(Zstep,L,E,method,step)+'</table>';
      if(method==1) html+= '<tr><td style="padding-left: 20px;">] импликанта '+tc.toconj()+' входит в ТДНФ<br>'+this.extraction(Zstep,L,E,method,step)+'</table>';
      if(method==3) this.extraction(Zstep,L,E,method,step);
    }else{
      if(method==0) html+= '</table>';
      if(method==2) html+= '</table>';
      if(method==1) html+= '</table>';
    }


  }else{//подошли к концу
    var ec= E.cost();
    if(this.MDNFcost[method] > ec || this.MDNFcost[method]==-1){
	this.MDNFcost[method]=ec;
	this.MDNF[method]=new Array();
    }
    if(this.MDNFcost[method]==ec)
      this.MDNF[method].push(E);
    if(method==2) html+= '<br>E: '+ E.tocset(1,1)+'<br>'+(this.havebranching==0?'МДНФ:'+E.todnf(true):'');
    if(method==0) html+= '<br>'+(this.havebranching?'ТДНФ: ':'МДНФ: ')+ E.todnf(true);
    if(method==1) html+= '<br>'+(this.havebranching?'ТДНФ: ':'МДНФ: ')+ E.todnf(true);
  }
  
  return html;
}

function build_cubes_table(Cstep,stable,step){// Cstep для левых и верхних полей
  var html='<table cellspacing=0 cellpadding=0 class="cubestable"><caption>Таблица операции C<sub>'+step+'</sub>*C<sub>'+step+'</sub></caption><tr><td class="top" nowrap>';
  for(var i=0;i<Cstep.a.length;i++)
    html+='<td class="top" nowrap>'+Cstep.a[i].tocube()+'</td>';
  for(i=0;i<Cstep.a.length;i++){
    html+='<tr>';
    html += '<td class="top" nowrap>'+Cstep.a[i].tocube()+'</td>';
    for(j=0;j<Cstep.a.length;j++)
      html+='<td>'+stable[i][j]+'</td>';
    html += '</tr>';
  }
  html+='</table>';
  return html+'<br>';
}

function buildtable(z,c,ker){
  var i,j;
  var t='<table cellpadding=0 cellspacing=0 class=mintable><tr><td>';
  var pt,pp,pz,zz;
  for(i=0;i<c.a.length;i++)
    t += "<td>"+c.a[i].toconj( c.a.length>5 )+"</td>"; 
  for(i=0;i<z.a.length;i++){
    pp = "<td>"+z.a[i].toconj()+"</td>";
    pt = '<tr>';
    for(j=0;j<c.a.length;j++){
      zz  = c.a[j].mark=='>' && z.a[i].mark == '*' && c.a[j].issub(z.a[i]);
      pp += (zz? '<td class="ker">' : '<td>')+( c.a[j].issub(z.a[i]) ? '+' : (OPERA?"":"<br>") ) + '</td>';
    }
   if(z.a[i].mark == '*' )
     pt = '<tr class="toker">';

    t+= pt+pp;
  }
  t+="</table>";
  return t;
}

function buildkarno(K,ker){ //единицы, экстримали, ядро
  if(gl.varscount!=6 && gl.varscount!=4)
    return "";
  var z = (gl.varscount==6?4:1);
     

  var b = new Array(new Array(0,4,12,8),new Array(1,5,13,9),new Array(3,7,15,11),new Array(2,6,14,10));
  var cc = new Array('00','01','11','10');
  var a = new Array(	'<img width=14 src="imgs/nx.png"><sub>5</sub><img width=14 src="imgs/nx.png"><sub>6</sub>',
			'<img width=14 src="imgs/nx.png"><sub>5</sub><img width=14 src="imgs/x.png"><sub>6</sub>',
			'<img width=14 src="imgs/x.png"><sub>5</sub><img width=14 src="imgs/nx.png"><sub>6</sub>',
			'<img width=14 src="imgs/x.png"><sub>5</sub><img width=14  src="imgs/x.png"><sub>6</sub>');
  var i,j,k,c,ex,inker;
  var t='<center><table class="forkarno">';
  for(k=0;k<z;k++){
    if(k%2==0)
      t+='<tr>';
    t+='<td>';
    if(z>1){
      t+=a[k]+'<br>';
    }

    t+='<table class="karno">';
    t+='<tr><td><img src="imgs/karno32.png"></td>';
    for(i=0;i<4;i++)
      t+='<td class="top">'+cc[i];
    for(i=0;i<4;i++){
      t+='<tr>';
      t+='<td class="top">'+cc[i]+'</td>';
      for(j=0;j<4;j++){
        c = new cube( b[i][j]*z+k );
	if( !K.intercube(c).isempty() ){

          for(ii=0;ii<K.a.length;ii++) //!
            if( K.a[ii].isequal(c) )   //!
              ex = K.a[ii].mark=='>';  //!

          inker = !ker.intercube(c).isempty();
          if(ex && inker)
            t+= '<td><img src="imgs/exker.png"></td>';
          if(ex && !inker)
            t+= '<td><img src="imgs/ex.png"></td>';
          if(!ex && inker)
            t+= '<td><img src="imgs/ker.png"></td>';
          if(!ex && !inker)
            t+= '<td><img src="imgs/fed.png"></td>';
        }else{
	  t+=  '<td>' + (OPERA?'':'<br>') + '</td>';
        }
      }
    }
    t+='</table>';
  }
  t+='</table></center>';
  return t;
}

function buildtableforcubes(z,c,newz){
  var i,j;
  var t='<table cellpadding=0 cellspacing=0 class=mintable><tr><td class="top" style="min-width: 8em;">&nbsp;</td>';
  var pt,pp,pz,zz;
  for(i=0;i<c.a.length;i++)
    t += '<td class="top">'+c.a[i].tocube(true) + '</td>';
  for(i=0;i<z.a.length;i++){
    pp = '<td class="top">'+z.a[i].tocube() + '</td>';
    pt = '<tr>';
    for(j=0;j<c.a.length;j++){
      zz  = c.a[j].mark=='>' && z.a[i].mark == '*' && c.a[j].issub(z.a[i]);

      pp += (zz? '<td class="ker">' : '<td>')+( c.a[j].issub(z.a[i]) ? '+' : (OPERA?"":"<br>") );
    }
   if(z.a[i].mark == '*')
     pt = '<tr class="toker">';

    t+= pt+pp;
  }
  t+="</table>";
  return t+'<br>';
}
