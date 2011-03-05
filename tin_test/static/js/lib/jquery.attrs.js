//(c) 2009 Michael Manning (actingthemaggot.com) 
jQuery.getAttributes=function(F,C){var F=((typeof F==="string")?jQuery(F)[0]:F[0]),D=0,F=F.attributes,B=F.length,E=["abort","blur","change","click","dblclick","error","focus","keydown","keypress","keyup","load","mousedown","mousemove","mouseout","mouseover","mouseup","reset","resize","select","submit","unload"],A={};for(D;D<B;D++){if(C||!C&&jQuery.inArray(F[D].nodeName.replace(/^on/,""),E)==-1){A[F[D].nodeName]=F[D].nodeValue}}return A}

