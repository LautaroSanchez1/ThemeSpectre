/*! Lazy Load 1.9.1 - MIT license - Copyright 2010-2013 Mika Tuupola */
!function(a,b,c,d){var e=a(b);a.fn.lazyload=function(f){function g(){var b=0;i.each(function(){var c=a(this);if(!j.skip_invisible||c.is(":visible"))if(a.abovethetop(this,j)||a.leftofbegin(this,j));else if(a.belowthefold(this,j)||a.rightoffold(this,j)){if(++b>j.failure_limit)return!1}else c.trigger("appear"),b=0})}var h,i=this,j={threshold:0,failure_limit:0,event:"scroll",effect:"show",container:b,data_attribute:"src",skip_invisible:!0,appear:null,load:null,placeholder:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"};return f&&(d!==f.failurelimit&&(f.failure_limit=f.failurelimit,delete f.failurelimit),d!==f.effectspeed&&(f.effect_speed=f.effectspeed,delete f.effectspeed),a.extend(j,f)),h=j.container===d||j.container===b?e:a(j.container),0===j.event.indexOf("scroll")&&h.on(j.event,function(){return g()}),this.each(function(){var b=this,c=a(b);b.loaded=!1,(c.attr("src")===d||c.attr("src")===!1)&&c.is("img")&&c.attr("src",j.placeholder),c.one("appear",function(){if(!this.loaded){if(j.appear){var d=i.length;j.appear.call(b,d,j)}a("<img />").on("load",function(){var d=c.attr(j.data_attribute);c.hide(),c.is("img")?c.attr("src",d):c.css("background-image","url('"+d+"')"),c[j.effect](j.effect_speed),b.loaded=!0;var e=a.grep(i,function(a){return!a.loaded});if(i=a(e),j.load){var f=i.length;j.load.call(b,f,j)}}).attr("src",c.attr(j.data_attribute))}}),0!==j.event.indexOf("scroll")&&c.on(j.event,function(){b.loaded||c.trigger("appear")})}),e.on("resize",function(){g()}),/(?:iphone|ipod|ipad).*os 5/gi.test(navigator.appVersion)&&e.on("pageshow",function(b){b.originalEvent&&b.originalEvent.persisted&&i.each(function(){a(this).trigger("appear")})}),a(c).ready(function(){g()}),this},a.belowthefold=function(c,f){var g;return g=f.container===d||f.container===b?(b.innerHeight?b.innerHeight:e.height())+e.scrollTop():a(f.container).offset().top+a(f.container).height(),g<=a(c).offset().top-f.threshold},a.rightoffold=function(c,f){var g;return g=f.container===d||f.container===b?e.width()+e.scrollLeft():a(f.container).offset().left+a(f.container).width(),g<=a(c).offset().left-f.threshold},a.abovethetop=function(c,f){var g;return g=f.container===d||f.container===b?e.scrollTop():a(f.container).offset().top,g>=a(c).offset().top+f.threshold+a(c).height()},a.leftofbegin=function(c,f){var g;return g=f.container===d||f.container===b?e.scrollLeft():a(f.container).offset().left,g>=a(c).offset().left+f.threshold+a(c).width()},a.inviewport=function(b,c){return!(a.rightoffold(b,c)||a.leftofbegin(b,c)||a.belowthefold(b,c)||a.abovethetop(b,c))},a.extend(a.expr[":"],{"below-the-fold":function(b){return a.belowthefold(b,{threshold:0})},"above-the-top":function(b){return!a.belowthefold(b,{threshold:0})},"right-of-screen":function(b){return a.rightoffold(b,{threshold:0})},"left-of-screen":function(b){return!a.rightoffold(b,{threshold:0})},"in-viewport":function(b){return a.inviewport(b,{threshold:0})},"above-the-fold":function(b){return!a.belowthefold(b,{threshold:0})},"right-of-fold":function(b){return a.rightoffold(b,{threshold:0})},"left-of-fold":function(b){return!a.rightoffold(b,{threshold:0})}})}(jQuery,window,document);

$(document).ready(function(){
	let open = true;
	/* DEFINIMOS TAMAÑOS */
	var wide = $(window).width();
	if(wide >= 1280) {
		$('#container').addClass('grid-xl');
	} else if(wide >= 960) {
		$('#container').addClass('grid-lg');
	} else if(wide >= 840) {
		$('#container').addClass('grid-md');
	} else if(wide >= 600) {
		$('#container').addClass('grid-sm');
	} else if(wide >= 480) {
		$('#container').addClass('grid-xs');
	}
	/* LAZYLOAD */
	$('img[src]').lazyload({data_attribute:'src',effect:"fadeIn",effectTime: 1000});
	/* AGREGAMOS LAS CLASES TOOLTIP */
	$('a[title]').addClass('tooltip tooltip-bottom');	
	/* EFECTO PARA EL MENU */
	let h = '190';
	$(window).on('scroll', function(){
		if ($(window).scrollTop() > h ) $('header.navbar').addClass('bgc');
		else $('header.navbar').removeClass('bgc');
	});
	/* PARALLAX */
	$(window).scroll(function(){
		var barra = $(window).scrollTop();
		var posicion =  (barra * 0.30);
		$('.hero.header').css({'background-position': '0 -' + posicion + 'px'});
	});
	/* BOTÓN SUBIR ARRIBA */
	var btn = $('#button');
	$(window).scroll(function() {
	   if ($(window).scrollTop() > 300) {
	      btn.removeClass('show',1200);
	   } else {
	      btn.addClass('show',1200);
	   }
	});
	btn.on('click', function(e) {
	   e.preventDefault();
	   $('html, body').animate({scrollTop:0}, '300');
	});
	/* CAMBIAMOS EL TAMAÑO A IMAGEN POST */
	var ImgWidth = $('img.img_smart').width();
	if(ImgWidth > 800) {
		$('img.img_smart').css('width','40%');
	}
});

function cat(type){
	$('#cats').toggle(1000);
}

var home = {
   cache: {},
   tab:function(type, obj){
   	console.log(type)
      // CSS
      $('.tab-block > li.tab-item').removeClass('active');
      $(obj).addClass('active');
      home.cargar(type);
    },
    // CARGAR CONTENIDO
    cargar: function(type){
     	$.ajax({
        	type: 'POST',
        	url: global_data.url + '/posts-' + type + '.php',
        	success: function(h){
        		$('#home_content').html(h);
        	}
      });
    },
}

//COMPARTIR EN REDES SOCIALES BY TO-UP.NET
function RedSocial(url) {
    window.open(url, 'nuevo', 'directories=no, location=no, menubar=no, scrollbars=yes, statusbar=no, tittlebar=no, width=700, height=400, left=300, top=150');
}
