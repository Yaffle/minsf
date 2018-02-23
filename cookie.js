function cookie_check_support() {
	cookie_set_value("checkcookie","OK");
	if(cookie_get_value("checkcookie")!="OK") {
		return 0;
	}
	cookie_delete("checkcookie");
	return 1;
}

function cookie_delete(name) {
	document.cookie = name + "=; expires=Thu, 01-Jan-70 00:00:01 GMT";
}

function cookie_get_value(name) {
	var value = "";	
	if(document.cookie != "") {
		var pos_name = document.cookie.indexOf(name + "=");
		if(pos_name >= 0) {
			pos_name = pos_name + name.length + 1;
			var pos_semikolon = document.cookie.indexOf(";", pos_name);
			if(pos_semikolon < 0)
				pos_semikolon = document.cookie.length;
			value = unescape(document.cookie.substring(pos_name, pos_semikolon));
		}
	}
	return value;
}

function cookie_set_value(name, value, msexpires) {
	var today = new Date();
	var expires = new Date();
	if(msexpires)
	  expires.setTime(today.getTime() + msexpires);
        else
	  expires.setTime(today.getTime() + 604800000); /* save cookie 7 days */
	document.cookie = name + "=" + escape(value) + "; expires=" + expires.toGMTString();
}
