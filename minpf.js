
document.addEventListener("DOMContentLoaded", function () {
  if (cookie_get_value("test")=="OK") {
    document.form1.inp1.value = cookie_get_value("inp1");
  }

  var elements = document.querySelectorAll(".minpf-do");
  var i = elements.length;
  var f = function (event) {
    var x = this.getAttribute("data-do");
    do1(x);
    event.preventDefault();
  };
  while (--i >= 0) {
    elements[i].onclick = f;
  }

  document.querySelector(".minpf-form1").addEventListener("submit", function (event) {
    event.preventDefault();
    do1(4);
  }, false);
}, false);

function do1(method){
  cookie_set_value("test","OK");
  cookie_set_value("inp1",document.form1.inp1.value);
  document.getElementById('outdiv').innerHTML='Пожалуйста подождите минуточку...';
  document.getElementById('outdiv').innerHTML = doall(document.form1.inp1.value,document.form1.select2.value,method);
}

window.setTimeout(function () {
  (new Image()).src = "https://counter.yadro.ru/hit?r" + encodeURIComponent(document.referrer) + (window.screen == undefined ? "" : ";s" + Number(window.screen.width).toString() + "*" + Number(window.screen.height).toString() + "*" + "24") + ";u" + encodeURIComponent(document.URL) + ";h" + ";" + (Math.random() + 1).toString().slice(2);
}, 0);
