$(document).ready(function() {
   $('textarea.imagen-desc').on('focus', function() {
      if ($(this).html() == 'Descripcion de la foto') $(this).html('');
   });
   //cuenta.chgprovincia(true);
   if (typeof $.browser.msie != 'undefined' && $.browser.version == '6.0') $('li.local-file > div.mini-modal').html('<div class="dialog-m"></div><span>Esta funci&oacute;n no es compatible con su navegador</span>');
});

function input_fake(x) {
   $('.input-hide-' + x).hide();
   $('.input-hidden-' + x).show().focus();
}
function desactivate(few) {
   if (!few) {
      mydialog.show();
      mydialog.title('Desactivar Cuenta');
      mydialog.body('&#191;Seguro que quiere desativar su cuenta?');
      mydialog.buttons(true, true, 'Desactivar', 'desactivate(true)', true, false, true, 'No', 'close', true, true);
      mydialog.center();
   } else {
      var pass = $('#passi');
      $('#loading').fadeIn(250);
      $.post(global_data.url + '/cuenta.php?action=desactivate', 'validar=' + 'ajaxcontinue', function(a) {
         mydialog.alert((a.charAt(0) == '0' ? 'Opps!' : 'Hecho'), (a.charAt(0) == '0' ? 'No se pudo desactivar' : 'Cuenta desactivada'), true);
         mydialog.center();
         $('#loading').fadeOut(250);
      });
   }
}
var cuenta = {
   ciudad_id: '',
   ciudad_text: '',
   no_requerido: new Array(),
   alert: function(secc, title, body) {
      $('div.alert-cuenta.cuenta-' + secc).html('<h2>' + title + '</h2>');
      $('div.alert-cuenta.cuenta-' + secc).slideDown(100);
   },
   alert_close: function(secc) {
      $('div.alert-cuenta.cuenta-' + secc).html('');
      $('div.alert-cuenta.cuenta-' + secc).slideUp(100);
   },

   chgtab: function(obj) {
      $('div.tabbed-d > div.floatL > ul.menu-tab > li.active').removeClass('active');
      $(obj).parent().addClass('active');
      var active = $(obj).html().toLowerCase().replace(' ', '-');
      $('div.content-tabs').hide();
      $('div.content-tabs.' + active).show();
   },
   chgsec: function(obj) {
      $('div.content-tabs.perfil > h3').removeClass('active');
      $('div.content-tabs.perfil > fieldset').slideUp(100);
      if ($(obj).next().css('display') == 'none') {
         $(obj).addClass('active');
         $(obj).next().slideDown(100).addClass('active');
      }
   },

   chgpais: function() {
      var pais = $('form[name=editarcuenta] select[name=pais]').val();
      var el_estado = $('form[name=editarcuenta] .content-tabs.cuenta select[name=estado]');

      //No se selecciono ningun pais.
      if (empty(pais)) {
         $('form[name=editarcuenta] select[name=estado]').addClass('disabled').attr('disabled', 'disabled').val('');
      } else {
         //Obtengo las estados
         $(el_estado).html('');
         $('#loading').fadeIn(250);
         $.ajax({
            type: 'GET',
            url: global_data.url + '/registro-geo.php',
            data: 'pais_code=' + pais,
            success: function(h) {
               switch (h.charAt(0)) {
                  case '0': //Error
                     break;
                  case '1': //OK
                     cuenta.no_requerido['estado'] = false;
                     $(el_estado).append(h.substring(3)).removeAttr('disabled').val('').focus();
                     break;
               }
               $('#loading').fadeOut(250);
            },
            error: function() {

            }
         });
      }
   },


   error: function(obj, str) {
      var container = $(obj).next();
      if ($(container).hasClass('errorstr')) {
         $(container).show();
         $(container).html(str);
      }
   },

   next: function(isprofile) {
      if (typeof isprofile == 'undefined') var isprofile = false;
      if (isprofile) $('div.content-tabs.perfil > h3.active').next().next().click();
      else $('div.tabbed-d > div.floatL > ul.menu-tab > li.active').next().children().click();
   },

   save: function(secc, next) {

      $('.ac_input, .cuenta-save-' + secc).removeClass('input-incorrect');

      if (typeof next == 'undefined') var next = false;
      params = Array();
      params.push('save=' + secc);

      $('.cuenta-save-' + secc).each(function() {
         if (($(this).attr('type') != 'checkbox' && $(this).attr('type') != 'radio') || $(this).prop('checked')) params.push($(this).attr('name') + '=' + encodeURIComponent($(this).val()));
      });

      var cuenta_url = global_data.url + '/cuenta.php?action=save&ajax=true';

      $('#loading').slideDown(250);
      $.ajax({
         type: 'post',
         url: cuenta_url,
         data: params.join('&'),
         dataType: 'json',
         success: function(r) {
            //$('#prueba').html(r.html);
            if (r.error) {
               if (r.field) $('input[name=' + r.field + ']').focus().addClass('input-incorrect');
               cuenta.alert(secc, r.error)
            } else {
               if (next) cuenta.next(secc > 1 && secc < 5);
               cuenta.alert(secc, 'Los cambios fueron aceptados y ser&aacute;n aplicados.');
               if (r.porc != null) {
                  $('#porc-completado-label').html('Perfil completo al ' + r.porc + '%');
                  $('.bar-item').css('width', r.porc + '%');
               }
            }
            window.location.hash = 'alert-cuenta';
            $('#loading').slideUp(250);
         }
      });
   },

   imagen: {

      add: function(obj) {
         var url = $(obj).prev().prev(),
            caption = $(obj).prev();
         $(url).removeClass('input-incorrect');
         $(caption).removeClass('input-incorrect');
         $('#loading').fadeIn(250);
         $.ajax({
            type: 'post',
            url: global_data.url + '/cuenta.php?ajax=1&action=add',
            data: 'url=' + $(url).val() + '&caption=' + $(caption).val(),
            dataType: 'json',
            success: function(r) {
               if (r.error) {
                  if (r.field) $(eval(r.field)).focus().addClass('input-incorrect');
                  else {
                     cuenta.alert(7, r.error);
                     window.location.hash = 'alert-cuenta';
                  }
               } else if (typeof r.id != 'undefined') {
                  $(obj).attr('onclick', '');
                  $(obj).off('click').on('click', function() {
                     cuenta.imagen.del(this, r.id);
                  });
                  $(obj).removeClass('misfotos-add').addClass('misfotos-del').html('Eliminar');
                  $(url).parent().prepend('<div class="floatL"><img src="' + $(url).val() + '" class="imagen-preview" /></div>')
                  $('<div class="field"><label>Imagen</label><div class="input-fake"><input value="http://" type="text" class="text" /><textarea style="margin-top:10px">Descripcion de la foto</textarea><a onclick="cuenta.imagen.add(this)" class="misfotos-add floatL">Agregar</a></div></div>').appendTo('.content-tabs.mis-fotos > fieldset');
               }
               $('#loading').fadeOut(250);
            }
         });
      },

      del: function(obj, id) {
         var container = $(obj).parent().parent();
         $('#loading').fadeIn(250);
         $.ajax({
            type: 'post',
            url: global_data.url + '/cuenta.php?ajax=1&action=del',
            data: 'id=' + id,
            dataType: 'json',
            success: function(r) {
               $(container).slideUp(100, function() {
                  $(container).remove();
                  cuenta.alert_close(7);
               });
               $('#loading').fadeOut(250);
            }
         });
      }

   }

}

var avatar = {

      uid: false,
      key: false,
      ext: false,
      crop_coord: false,
      current: false,
      success: false,

      edit: function(obj) {
         if ($(obj).html() == 'Editar') {
            $('.change-avatar').slideDown(100);
            $('#avatar-edit').toggleClass('btn-error', 'btn-success');
            $(obj).html('Cancelar');
         } else {
            $('div.sidebar-tabs > div.webcam-capture, div.mini-modal').hide();
            $('div.sidebar-tabs > img:first, div.avatar-big-cont').show();
            $('ul.change-avatar > li').removeClass('active');
            $('.change-avatar').slideUp(100);
            $('#avatar-edit').toggleClass('btn-success', 'btn-error');
            $(obj).html('Editar');
         }
      },
      chgtab: function(obj) {
         var container = $(obj).parent().parent();
         var close = container.hasClass('active');
         $('ul.change-avatar > li').removeClass('active');
         $('div.sidebar-tabs > div.webcam-capture, div.mini-modal').hide();
         $('div.sidebar-tabs > div.avatar-big-cont').show();
         if (!close) {
            container.addClass('active');
            if (container.hasClass('webcam-file')) {
               $('div.sidebar-tabs > div.avatar-big-cont').hide();
               $('div.sidebar-tabs > div.webcam-capture').show();
            } else $(obj).parent().next().show();
         }
      },
      upload: function(obj) {
         if ($(obj).hasClass("local")) {
            if ($('input#file-avatar').val()) {
               if (isImageFile($('input#file-avatar').val())) {
                  $('div.avatar-loading').show();
                  $.ajaxFileUpload({
                     url: global_data.url + '/upload-avatar.php',
                     fileElementId: 'file-avatar',
                     dataType: 'json',
                     success: this.uploadsuccess
                  });
               } else mydialog.alert('Error', 'El archivo es invalido como imagen.');
            } else mydialog.alert('Error', 'No hay un archivo seleccionado..');
         } else if ($(obj).hasClass("url")) {
            var url_file = $('input#url-avatar').val();
            if (url_file && isImageFile(url_file)) {
               $('div.avatar-loading').show();
               $(obj).attr('disabled', 'true');
               $.ajax({
                  type: 'post',
                  url: global_data.url + '/upload-avatar.php',
                  data: 'url=' + url_file,
                  dataType: 'json',
                  success: this.uploadsuccess,
                  complete: function() {
                     $(obj).attr('disabled', 'true');
                  }
               });
            } else mydialog.alert('Error', 'El archivo es invalido como imagen.');
         }
         return false;
      },
      uploadsuccess: function(r) {
         $('div.avatar-loading').hide();
         if (r.error == 'success') {
            avatar.success = true;
            avatar.close();
         } else if (r.msg) {
            avatar.key = r.key;
            avatar.ext = r.ext;
            avatar.crop(r.msg);
         } else mydialog.alert('Alerta', r);
      },
      crop: function(img) {
         mydialog.show();
         $('#modalBody').css('padding', 0);
         mydialog.title('Cortar avatar');
         mydialog.body('<img class="avatar-crop" src="' + img + '?' + Math.random() + '" onload="mydialog.center()">');
         mydialog.buttons(true, true, 'Guardar', 'avatar.save()', true, false, true, 'Cancelar', 'avatar.close()', true, true);
         $('img.avatar-big').attr('src', img + '?' + Math.random()).on('load', function() {
            $('img.avatar-crop').Jcrop({
               aspectRatio: 1,
               sideHandles: false,
               setSelect: [0, 0, 120, 120],
               onChange: avatar.preview,
               onSelect: function(c) {
                  avatar.crop_coord = c;
               }
            })
         });
      },
      reload: function() {
         $('.avatar-big').attr('src', this.current + '?' + Math.random()).css({
            margin: 0,
            width: '120px',
            height: '120px'
         });
      },
      close: function() {
         mydialog.body('');
         mydialog.close();
         $('a.edit').click();
         if (avatar.success) {
            avatar.success = false;
            var currentdate = new Date(); //pinche cache
            var img_url = global_data.url + '/files/avatar/' + global_data.user_key + '_120.jpg?date=' + currentdate.getDate() + (currentdate.getMonth() + 1) + currentdate.getFullYear() + currentdate.getHours() + currentdate.getMinutes() + currentdate.getSeconds();
            $('#avatar-img').attr({
               'src': img_url
            }).fadeIn();
            $('#avatar_menu_desktop').attr({
               'src': img_url
            }).fadeIn();
            $('#avatar_menu_mobile').attr({
               'src': img_url
            }).fadeIn();
            $('div.avatar-loading').hide();
         }
      },

      save: function() {
         if (!this.crop_coord) mydialog.alert('Error!', 'Tienes que seleccionar parte de la foto');
         else {
            $('div.avatar-loading').show();
            $('#loading').fadeIn(250);
            $.ajax({
               type: 'post',
               url: global_data.url + '/upload-crop.php',
               data: 'key=' + this.key + '&ext=' + this.ext + '&x=' + this.crop_coord.x + '&y=' + this.crop_coord.y + '&w=' + this.crop_coord.w + '&h=' + this.crop_coord.h,
               dataType: 'json',
               success: function(r) {
                  if (r.error == 'success') {
                     cuenta.alert('1', 'Avatar guardado exitosamente');
                     avatar.success = true;
                     avatar.close();
                  } else mydialog.alert('Error', r.error);

                  $('#loading').fadeOut(250);
               }
            });
         }
      }
   }
   /*
      isImageFile(filename)
   */
function isImageFile(filename) {
   var ext = (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename.toLowerCase()) : '';
   if (ext && /^(jpg|png|jpeg|gif)$/.test(ext)) return true;
   else return false;
}
jQuery.extend({

   createUploadIframe: function(id, uri) {
      var frameId = 'jUploadFrame' + id;
      if (window.ActiveXObject) {
         var io = document.createElement('<iframe id="' + frameId + '" name="' + frameId + '" />');
         if (typeof uri == 'boolean') io.src = 'javascript:false';
         else if (typeof uri == 'string') io.src = uri;
      } else {
         var io = document.createElement('iframe');
         $(io).attr({
            id: frameId,
            name: frameId
         })
      }
      $(io).css({
         position: 'absolute',
         top: '-1000px',
         left: '-1000px'
      });
      document.body.appendChild(io);
      return io
   },

   createUploadForm: function(id, fileElementId) {
      var formId = 'jUploadForm' + id;
      var fileId = 'jUploadFile' + id;
      var form = $('<form  action="" method="POST" name="' + formId + '" id="' + formId + '" enctype="multipart/form-data"></form>');
      var oldElement = $('#' + fileElementId);
      var newElement = $(oldElement).clone();
      $(oldElement).attr('id', fileId);
      $(oldElement).before(newElement);
      $(oldElement).appendTo(form);
      $(form).css({
         position: 'absolute',
         top: '-1200px',
         left: '-1200px'
      });
      $(form).appendTo('body');
      return form;
   },

   ajaxFileUpload: function(s) {
      s = jQuery.extend({}, jQuery.ajaxSettings, s);
      var id = new Date().getTime();
      var form = jQuery.createUploadForm(id, s.fileElementId);
      var io = jQuery.createUploadIframe(id, s.secureuri);
      var frameId = 'jUploadFrame' + id;
      var formId = 'jUploadForm' + id;
      if (s.global && !jQuery.active++) jQuery.event.trigger('ajaxStart');
      var requestDone = false;
      var xml = {}
      if (s.global) jQuery.event.trigger('ajaxSend', [xml, s]);
      var uploadCallback = function(isTimeout) {
         var io = document.getElementById(frameId);
         try {
            if (io.contentWindow) {
               xml.responseText = io.contentWindow.document.body ? io.contentWindow.document.body.innerHTML : null;
               xml.responseXML = io.contentWindow.document.XMLDocument ? io.contentWindow.document.XMLDocument : io.contentWindow.document;
            } else if (io.contentDocument) {
               xml.responseText = io.contentDocument.document.body ? io.contentDocument.document.body.innerHTML : null;
               xml.responseXML = io.contentDocument.document.XMLDocument ? io.contentDocument.document.XMLDocument : io.contentDocument.document;
            }
         } catch (e) {
            jQuery.handleError(s, xml, null, e);
         }
         if (xml || isTimeout == 'timeout') {
            requestDone = true;
            var status;
            try {
               status = isTimeout != 'timeout' ? 'success' : 'error';
               if (status != 'error') {
                  var data = jQuery.uploadHttpData(xml, s.dataType);
                  if (s.success) s.success(data, status);
                  if (s.global) jQuery.event.trigger('ajaxSuccess', [xml, s]);
               } else jQuery.handleError(s, xml, status);
            } catch (e) {
               status = 'error';
               jQuery.handleError(s, xml, status, e);
            }
            if (s.global) jQuery.event.trigger('ajaxComplete', [xml, s]);
            if (s.global && !--jQuery.active) jQuery.event.trigger('ajaxStop');
            if (s.complete) s.complete(xml, status);
            jQuery(io).off();
            setTimeout(function() {
               try {
                  $(io).remove();
                  $(form).remove();
               } catch (e) {
                  jQuery.handleError(s, xml, null, e);
               }
            }, 100);
            xml = null;
         }
      }
      if (s.timeout > 0) setTimeout(function() {
         if (!requestDone) uploadCallback('timeout');
      }, s.timeout);
      try {
         var form = $('#' + formId);
         $(form).attr({
            action: s.url,
            method: 'post',
            target: frameId
         });
         if (form.encoding) form.encoding = 'multipart/form-data';
         else form.enctype = 'multipart/form-data';
         $(form).submit();
      } catch (e) {
         jQuery.handleError(s, xml, null, e);
      }
      if ($.browser.opera) document.getElementById(frameId).onload = uploadCallback;
      else {
         if (window.attachEvent) document.getElementById(frameId).attachEvent('onload', uploadCallback);
         else document.getElementById(frameId).addEventListener('load', uploadCallback, false);
      }
      return {
         abort: function() {}
      };
   },

   uploadHttpData: function(r, type) {
      var data = !type;
      data = type == 'xml' || data ? r.responseXML : r.responseText;
      if (type == 'script') jQuery.globalEval(data);
      if (type == 'json') eval('data =' + data);
      return data;
   }

});

/* Jcrop.min.js v2.0.4 - Copyright 2008-2015 Tapmodo Interactive LLC */
!function(a){"use strict";var b=function(c,d){var e=navigator.userAgent.toLowerCase();this.opt=a.extend({},b.defaults,d||{}),this.container=a(c),this.opt.is_msie=/msie/.test(e),this.opt.is_ie_lt9=/msie [1-8]\./.test(e),this.container.addClass(this.opt.css_container),this.ui={},this.state=null,this.ui.multi=[],this.ui.selection=null,this.filter={},this.init(),this.setOptions(d),this.applySizeConstraints(),this.container.trigger("cropinit",this),this.opt.is_ie_lt9&&(this.opt.dragEventTarget=document.body)};a.extend(b,{component:{},filter:{},stage:{},registerComponent:function(a,c){b.component[a]=c},registerFilter:function(a,c){b.filter[a]=c},registerStageType:function(a,c){b.stage[a]=c},attach:function(b,c){var d=new a.Jcrop(b,c);return d},imgCopy:function(a){var b=new Image;return b.src=a.src,b},imageClone:function(c){return a.Jcrop.supportsCanvas?b.canvasClone(c):b.imgCopy(c)},canvasClone:function(b){var c=document.createElement("canvas"),d=c.getContext("2d");return a(c).width(b.width).height(b.height),c.width=b.naturalWidth,c.height=b.naturalHeight,d.drawImage(b,0,0,b.naturalWidth,b.naturalHeight),c},propagate:function(a,b,c){for(var d=0,e=a.length;e>d;d++)b.hasOwnProperty(a[d])&&(c[a[d]]=b[a[d]])},getLargestBox:function(a,b,c){return b/c>a?[c*a,c]:[b,b/a]},stageConstructor:function(c,d,e){var f=[];a.each(b.stage,function(a,b){f.push(b)}),f.sort(function(a,b){return a.priority-b.priority});for(var g=0,h=f.length;h>g;g++)if(f[g].isSupported(c,d)){f[g].create(c,d,function(a,b){"function"==typeof e&&e(a,b)});break}},supportsColorFade:function(){return a.fx.step.hasOwnProperty("backgroundColor")},wrapFromXywh:function(a){var b={x:a[0],y:a[1],w:a[2],h:a[3]};return b.x2=b.x+b.w,b.y2=b.y+b.h,b}});var c=function(){};a.extend(c,{isSupported:function(a,b){return!0},priority:100,create:function(a,b,d){var e=new c;e.element=a,d.call(this,e,b)},prototype:{attach:function(a){this.init(a),a.ui.stage=this},triggerEvent:function(b){return a(this.element).trigger(b),this},getElement:function(){return this.element}}}),b.registerStageType("Block",c);var d=function(){};d.prototype=new c,a.extend(d,{isSupported:function(a,b){return"IMG"==a.tagName?!0:void 0},priority:90,create:function(b,c,e){a.Jcrop.component.ImageLoader.attach(b,function(f,g){var h=new d;h.element=a(b).wrap("<div />").parent(),h.element.width(f).height(g),h.imgsrc=b,"function"==typeof e&&e.call(this,h,c)})}}),b.registerStageType("Image",d);var e=function(){this.angle=0,this.scale=1,this.scaleMin=.2,this.scaleMax=1.25,this.offset=[0,0]};e.prototype=new d,a.extend(e,{isSupported:function(b,c){return a.Jcrop.supportsCanvas&&"IMG"==b.tagName?!0:void 0},priority:60,create:function(b,c,d){var f=a(b),g=a.extend({},c);a.Jcrop.component.ImageLoader.attach(b,function(a,c){var h=new e;f.hide(),h.createCanvas(b,a,c),f.before(h.element),h.imgsrc=b,g.imgsrc=b,"function"==typeof d&&(d(h,g),h.redraw())})}}),a.extend(e.prototype,{init:function(a){this.core=a},setOffset:function(a,b){return this.offset=[a,b],this},setAngle:function(a){return this.angle=a,this},setScale:function(a){return this.scale=this.boundScale(a),this},boundScale:function(a){return a<this.scaleMin?a=this.scaleMin:a>this.scaleMax&&(a=this.scaleMax),a},createCanvas:function(b,c,d){this.width=c,this.height=d,this.canvas=document.createElement("canvas"),this.canvas.width=c,this.canvas.height=d,this.$canvas=a(this.canvas).width("100%").height("100%"),this.context=this.canvas.getContext("2d"),this.fillstyle="rgb(0,0,0)",this.element=this.$canvas.wrap("<div />").parent().width(c).height(d)},triggerEvent:function(a){return this.$canvas.trigger(a),this},clear:function(){return this.context.fillStyle=this.fillstyle,this.context.fillRect(0,0,this.canvas.width,this.canvas.height),this},redraw:function(){return this.context.save(),this.clear(),this.context.translate(parseInt(.5*this.width),parseInt(.5*this.height)),this.context.translate(this.offset[0]/this.core.opt.xscale,this.offset[1]/this.core.opt.yscale),this.context.rotate(this.angle*(Math.PI/180)),this.context.scale(this.scale,this.scale),this.context.translate(-parseInt(.5*this.width),-parseInt(.5*this.height)),this.context.drawImage(this.imgsrc,0,0,this.width,this.height),this.context.restore(),this.$canvas.trigger("cropredraw"),this},setFillStyle:function(a){return this.fillstyle=a,this}}),b.registerStageType("Canvas",e);var f=function(){this.minw=40,this.minh=40,this.maxw=0,this.maxh=0,this.core=null};a.extend(f.prototype,{tag:"backoff",priority:22,filter:function(a){var b=this.bound;return a.x<b.minx&&(a.x=b.minx,a.x2=a.w+a.x),a.y<b.miny&&(a.y=b.miny,a.y2=a.h+a.y),a.x2>b.maxx&&(a.x2=b.maxx,a.x=a.x2-a.w),a.y2>b.maxy&&(a.y2=b.maxy,a.y=a.y2-a.h),a},refresh:function(a){this.elw=a.core.container.width(),this.elh=a.core.container.height(),this.bound={minx:0+a.edge.w,miny:0+a.edge.n,maxx:this.elw+a.edge.e,maxy:this.elh+a.edge.s}}}),b.registerFilter("backoff",f);var g=function(){this.core=null};a.extend(g.prototype,{tag:"constrain",priority:5,filter:function(a,b){return"move"==b?(a.x<this.minx&&(a.x=this.minx,a.x2=a.w+a.x),a.y<this.miny&&(a.y=this.miny,a.y2=a.h+a.y),a.x2>this.maxx&&(a.x2=this.maxx,a.x=a.x2-a.w),a.y2>this.maxy&&(a.y2=this.maxy,a.y=a.y2-a.h)):(a.x<this.minx&&(a.x=this.minx),a.y<this.miny&&(a.y=this.miny),a.x2>this.maxx&&(a.x2=this.maxx),a.y2>this.maxy&&(a.y2=this.maxy)),a.w=a.x2-a.x,a.h=a.y2-a.y,a},refresh:function(a){this.elw=a.core.container.width(),this.elh=a.core.container.height(),this.minx=0+a.edge.w,this.miny=0+a.edge.n,this.maxx=this.elw+a.edge.e,this.maxy=this.elh+a.edge.s}}),b.registerFilter("constrain",g);var h=function(){this.core=null};a.extend(h.prototype,{tag:"extent",priority:12,offsetFromCorner:function(a,b,c){var d=b[0],e=b[1];switch(a){case"bl":return[c.x2-d,c.y,d,e];case"tl":return[c.x2-d,c.y2-e,d,e];case"br":return[c.x,c.y,d,e];case"tr":return[c.x,c.y2-e,d,e]}},getQuadrant:function(a){var b=a.opposite[0]-a.offsetx,c=a.opposite[1]-a.offsety;return 0>b&&0>c?"br":b>=0&&c>=0?"tl":0>b&&c>=0?"tr":"bl"},filter:function(a,c,d){if("move"==c)return a;var e=a.w,f=a.h,g=d.state,h=this.limits,i=g?this.getQuadrant(g):"br";return h.minw&&e<h.minw&&(e=h.minw),h.minh&&f<h.minh&&(f=h.minh),h.maxw&&e>h.maxw&&(e=h.maxw),h.maxh&&f>h.maxh&&(f=h.maxh),e==a.w&&f==a.h?a:b.wrapFromXywh(this.offsetFromCorner(i,[e,f],a))},refresh:function(a){this.elw=a.core.container.width(),this.elh=a.core.container.height(),this.limits={minw:a.minSize[0],minh:a.minSize[1],maxw:a.maxSize[0],maxh:a.maxSize[1]}}}),b.registerFilter("extent",h);var i=function(){this.stepx=1,this.stepy=1,this.core=null};a.extend(i.prototype,{tag:"grid",priority:19,filter:function(a){var b={x:Math.round(a.x/this.stepx)*this.stepx,y:Math.round(a.y/this.stepy)*this.stepy,x2:Math.round(a.x2/this.stepx)*this.stepx,y2:Math.round(a.y2/this.stepy)*this.stepy};return b.w=b.x2-b.x,b.h=b.y2-b.y,b}}),b.registerFilter("grid",i);var j=function(){this.ratio=0,this.core=null};a.extend(j.prototype,{tag:"ratio",priority:15,offsetFromCorner:function(a,b,c){var d=b[0],e=b[1];switch(a){case"bl":return[c.x2-d,c.y,d,e];case"tl":return[c.x2-d,c.y2-e,d,e];case"br":return[c.x,c.y,d,e];case"tr":return[c.x,c.y2-e,d,e]}},getBoundRatio:function(a,c){var d=b.getLargestBox(this.ratio,a.w,a.h);return b.wrapFromXywh(this.offsetFromCorner(c,d,a))},getQuadrant:function(a){var b=a.opposite[0]-a.offsetx,c=a.opposite[1]-a.offsety;return 0>b&&0>c?"br":b>=0&&c>=0?"tl":0>b&&c>=0?"tr":"bl"},filter:function(a,b,c){if(!this.ratio)return a;var d=(a.w/a.h,c.state),e=d?this.getQuadrant(d):"br";if(b=b||"se","move"==b)return a;switch(b){case"n":a.x2=this.elw,a.w=a.x2-a.x,e="tr";break;case"s":a.x2=this.elw,a.w=a.x2-a.x,e="br";break;case"e":a.y2=this.elh,a.h=a.y2-a.y,e="br";break;case"w":a.y2=this.elh,a.h=a.y2-a.y,e="bl"}return this.getBoundRatio(a,e)},refresh:function(a){this.ratio=a.aspectRatio,this.elw=a.core.container.width(),this.elh=a.core.container.height()}}),b.registerFilter("ratio",j);var k=function(){this.core=null};a.extend(k.prototype,{tag:"round",priority:90,filter:function(a){var b={x:Math.round(a.x),y:Math.round(a.y),x2:Math.round(a.x2),y2:Math.round(a.y2)};return b.w=b.x2-b.x,b.h=b.y2-b.y,b}}),b.registerFilter("round",k);var l=function(a,b){this.color=b||"black",this.opacity=a||.5,this.core=null,this.shades={}};a.extend(l.prototype,{tag:"shader",fade:!0,fadeEasing:"swing",fadeSpeed:320,priority:95,init:function(){var b=this;b.attached||(b.visible=!1,b.container=a("<div />").addClass(b.core.opt.css_shades).prependTo(this.core.container).hide(),b.elh=this.core.container.height(),b.elw=this.core.container.width(),b.shades={top:b.createShade(),right:b.createShade(),left:b.createShade(),bottom:b.createShade()},b.attached=!0)},destroy:function(){this.container.remove()},setColor:function(c,d){var e=this;if(c==e.color)return e;this.color=c;var f=b.supportsColorFade();return a.each(e.shades,function(a,b){e.fade&&!d&&f?b.animate({backgroundColor:c},{queue:!1,duration:e.fadeSpeed,easing:e.fadeEasing}):b.css("backgroundColor",c)}),e},setOpacity:function(b,c){var d=this;return b==d.opacity?d:(d.opacity=b,a.each(d.shades,function(a,e){!d.fade||c?e.css({opacity:b}):e.animate({opacity:b},{queue:!1,duration:d.fadeSpeed,easing:d.fadeEasing})}),d)},createShade:function(){return a("<div />").css({position:"absolute",backgroundColor:this.color,opacity:this.opacity}).appendTo(this.container)},refresh:function(a){var b=this.core,c=this.shades;this.setColor(a.bgColor?a.bgColor:this.core.opt.bgColor),this.setOpacity(a.bgOpacity?a.bgOpacity:this.core.opt.bgOpacity),this.elh=b.container.height(),this.elw=b.container.width(),c.right.css("height",this.elh+"px"),c.left.css("height",this.elh+"px")},filter:function(a,b,c){if(!c.active)return a;var d=this,e=d.shades;return e.top.css({left:Math.round(a.x)+"px",width:Math.round(a.w)+"px",height:Math.round(a.y)+"px"}),e.bottom.css({top:Math.round(a.y2)+"px",left:Math.round(a.x)+"px",width:Math.round(a.w)+"px",height:d.elh-Math.round(a.y2)+"px"}),e.right.css({left:Math.round(a.x2)+"px",width:d.elw-Math.round(a.x2)+"px"}),e.left.css({width:Math.round(a.x)+"px"}),d.visible||(d.container.show(),d.visible=!0),a}}),b.registerFilter("shader",l);var m=function(a){this.stage=a,this.core=a.core,this.cloneStagePosition()};m.prototype={cloneStagePosition:function(){var a=this.stage;this.angle=a.angle,this.scale=a.scale,this.offset=a.offset},getElement:function(){var b=this.stage;return a("<div />").css({position:"absolute",top:b.offset[0]+"px",left:b.offset[1]+"px",width:b.angle+"px",height:b.scale+"px"})},animate:function(a){var b=this;this.scale=this.stage.boundScale(this.scale),b.stage.triggerEvent("croprotstart"),b.getElement().animate({top:b.offset[0]+"px",left:b.offset[1]+"px",width:b.angle+"px",height:b.scale+"px"},{easing:b.core.opt.animEasing,duration:b.core.opt.animDuration,complete:function(){b.stage.triggerEvent("croprotend"),"function"==typeof a&&a.call(this)},progress:function(a){var c,d={},e=a.tweens;for(c=0;c<e.length;c++)d[e[c].prop]=e[c].now;b.stage.setAngle(d.width).setScale(d.height).setOffset(d.top,d.left).redraw()}})}},b.stage.Canvas.prototype.getAnimator=function(){return new m(this)},b.registerComponent("CanvasAnimator",m);var o=function(a){this.selection=a,this.core=a.core};o.prototype={getElement:function(){var b=this.selection.get();return a("<div />").css({position:"absolute",top:b.y+"px",left:b.x+"px",width:b.w+"px",height:b.h+"px"})},animate:function(a,b,c,d,e){var f=this;f.selection.allowResize(!1),f.getElement().animate({top:b+"px",left:a+"px",width:c+"px",height:d+"px"},{easing:f.core.opt.animEasing,duration:f.core.opt.animDuration,complete:function(){f.selection.allowResize(!0),e&&e.call(this)},progress:function(a){var b,c={},d=a.tweens;for(b=0;b<d.length;b++)c[d[b].prop]=d[b].now;var e={x:parseInt(c.left),y:parseInt(c.top),w:parseInt(c.width),h:parseInt(c.height)};e.x2=e.x+e.w,e.y2=e.y+e.h,f.selection.updateRaw(e,"se")}})}},b.registerComponent("Animator",o);var p=function(a,b,c){var d=this;d.x=a.pageX,d.y=a.pageY,d.selection=b,d.eventTarget=b.core.opt.dragEventTarget,d.orig=b.get(),b.callFilterFunction("refresh");var e=b.core.container.position();d.elx=e.left,d.ely=e.top,d.offsetx=0,d.offsety=0,d.ord=c,d.opposite=d.getOppositeCornerOffset(),d.initEvents(a)};p.prototype={getOppositeCornerOffset:function(){var a=this.orig,b=this.x-this.elx-a.x,c=this.y-this.ely-a.y;switch(this.ord){case"nw":case"w":return[a.w-b,a.h-c];case"sw":return[a.w-b,-c];case"se":case"s":case"e":return[-b,-c];case"ne":case"n":return[-b,a.h-c]}return[null,null]},initEvents:function(b){a(this.eventTarget).on("mousemove.jcrop",this.createDragHandler()).on("mouseup.jcrop",this.createStopHandler())},dragEvent:function(a){this.offsetx=a.pageX-this.x,this.offsety=a.pageY-this.y,this.selection.updateRaw(this.getBox(),this.ord)},endDragEvent:function(a){var b=this.selection;b.core.container.removeClass("jcrop-dragging"),b.element.trigger("cropend",[b,b.core.unscale(b.get())]),b.focus()},createStopHandler:function(){var b=this;return function(c){return a(b.eventTarget).off(".jcrop"),b.endDragEvent(c),!1}},createDragHandler:function(){var a=this;return function(b){return a.dragEvent(b),!1}},update:function(a,b){var c=this;c.offsetx=a-c.x,c.offsety=b-c.y},resultWrap:function(a){var b={x:Math.min(a[0],a[2]),y:Math.min(a[1],a[3]),x2:Math.max(a[0],a[2]),y2:Math.max(a[1],a[3])};return b.w=b.x2-b.x,b.h=b.y2-b.y,b},getBox:function(){var a=this,b=a.orig,c={x2:b.x+b.w,y2:b.y+b.h};switch(a.ord){case"n":return a.resultWrap([b.x,a.offsety+b.y,c.x2,c.y2]);case"s":return a.resultWrap([b.x,b.y,c.x2,a.offsety+c.y2]);case"e":return a.resultWrap([b.x,b.y,a.offsetx+c.x2,c.y2]);case"w":return a.resultWrap([b.x+a.offsetx,b.y,c.x2,c.y2]);case"sw":return a.resultWrap([a.offsetx+b.x,b.y,c.x2,a.offsety+c.y2]);case"se":return a.resultWrap([b.x,b.y,a.offsetx+c.x2,a.offsety+c.y2]);case"ne":return a.resultWrap([b.x,a.offsety+b.y,a.offsetx+c.x2,c.y2]);case"nw":return a.resultWrap([a.offsetx+b.x,a.offsety+b.y,c.x2,c.y2]);case"move":return c.nx=b.x+a.offsetx,c.ny=b.y+a.offsety,a.resultWrap([c.nx,c.ny,c.nx+b.w,c.ny+b.h])}}},b.registerComponent("DragState",p);var q=function(a){this.core=a};q.prototype={on:function(b,c){a(this).on(b,c)},off:function(b){a(this).off(b)},trigger:function(b){a(this).trigger(b)}},b.registerComponent("EventManager",q);var r=function(a,b,c){this.src=a,b||(b=new Image),this.element=b,this.callback=c,this.load()};a.extend(r,{attach:function(a,b){return new r(a.src,a,b)},prototype:{getDimensions:function(){var a=this.element;return a.naturalWidth?[a.naturalWidth,a.naturalHeight]:a.width?[a.width,a.height]:null},fireCallback:function(){this.element.onload=null,"function"==typeof this.callback&&this.callback.apply(this,this.getDimensions())},isLoaded:function(){return this.element.complete},load:function(){var a=this,b=a.element;b.src=a.src,a.isLoaded()?a.fireCallback():a.element.onload=function(b){a.fireCallback()}}}}),b.registerComponent("ImageLoader",r);var s=function(a){this.core=a,this.init()};a.extend(s,{support:function(){return"ontouchstart"in window||window.DocumentTouch&&document instanceof DocumentTouch?!0:void 0},prototype:{init:function(){var b=this,c=a.Jcrop.component.DragState.prototype;c.touch||(b.initEvents(),b.shimDragState(),b.shimStageDrag(),c.touch=!0)},shimDragState:function(){var b=this;a.Jcrop.component.DragState.prototype.initEvents=function(c){"touch"==c.type.substr(0,5)?a(this.eventTarget).on("touchmove.jcrop.jcrop-touch",b.dragWrap(this.createDragHandler())).on("touchend.jcrop.jcrop-touch",this.createStopHandler()):a(this.eventTarget).on("mousemove.jcrop",this.createDragHandler()).on("mouseup.jcrop",this.createStopHandler())}},shimStageDrag:function(){this.core.container.addClass("jcrop-touch").on("touchstart.jcrop.jcrop-stage",this.dragWrap(this.core.ui.manager.startDragHandler()))},dragWrap:function(a){return function(b){return b.preventDefault(),b.stopPropagation(),"touch"==b.type.substr(0,5)?(b.pageX=b.originalEvent.changedTouches[0].pageX,b.pageY=b.originalEvent.changedTouches[0].pageY,a(b)):!1}},initEvents:function(){var a=this,b=a.core;b.container.on("touchstart.jcrop.jcrop-touch","."+b.opt.css_drag,a.dragWrap(b.startDrag()))}}}),b.registerComponent("Touch",s);var t=function(a){this.core=a,this.init()};a.extend(t,{defaults:{eventName:"keydown.jcrop",passthru:[9],debug:!1},prototype:{init:function(){a.extend(this,t.defaults),this.enable()},disable:function(){this.core.container.off(this.eventName)},enable:function(){var b=this,c=b.core;c.container.on(b.eventName,function(d){var e=d.shiftKey?16:2;if(a.inArray(d.keyCode,b.passthru)>=0)return!0;switch(d.keyCode){case 37:c.nudge(-e,0);break;case 38:c.nudge(0,-e);break;case 39:c.nudge(e,0);break;case 40:c.nudge(0,e);break;case 46:case 8:return c.requestDelete(),!1;default:b.debug&&console.log("keycode: "+d.keyCode)}d.metaKey||d.ctrlKey||d.preventDefault()})}}}),b.registerComponent("Keyboard",t);var u=function(){};a.extend(u,{defaults:{minSize:[8,8],maxSize:[0,0],aspectRatio:0,edge:{n:0,s:0,e:0,w:0},bgColor:null,bgOpacity:null,last:null,state:null,active:!0,linked:!0,canDelete:!0,canDrag:!0,canResize:!0,canSelect:!0},prototype:{init:function(a){this.core=a,this.startup(),this.linked=this.core.opt.linked,this.attach(),this.setOptions(this.core.opt),a.container.trigger("cropcreate",[this])},attach:function(){},startup:function(){var b=this,c=b.core.opt;a.extend(b,u.defaults),b.filter=b.core.getDefaultFilters(),b.element=a("<div />").addClass(c.css_selection).data({selection:b}),b.frame=a("<button />").addClass(c.css_button).data("ord","move").attr("type","button"),b.element.append(b.frame).appendTo(b.core.container),b.core.opt.is_msie&&b.frame.css({opacity:0,backgroundColor:"white"}),b.insertElements(),b.frame.on("focus.jcrop",function(a){b.core.setSelection(b),b.element.trigger("cropfocus",b),b.element.addClass("jcrop-focus")}).on("blur.jcrop",function(a){b.element.removeClass("jcrop-focus"),b.element.trigger("cropblur",b)})},propagate:["canDelete","canDrag","canResize","canSelect","minSize","maxSize","aspectRatio","edge"],setOptions:function(a){return b.propagate(this.propagate,a,this),this.refresh(),this},refresh:function(){this.allowResize(),this.allowDrag(),this.allowSelect(),this.callFilterFunction("refresh"),this.updateRaw(this.get(),"se")},callFilterFunction:function(a,b){for(var c=0;c<this.filter.length;c++)this.filter[c][a]&&this.filter[c][a](this);return this},addFilter:function(a){a.core=this.core,this.hasFilter(a)||(this.filter.push(a),this.sortFilters(),a.init&&a.init(),this.refresh())},hasFilter:function(a){var b,c=this.filter;for(b=0;b<c.length;b++)if(c[b]===a)return!0},sortFilters:function(){this.filter.sort(function(a,b){return a.priority-b.priority})},clearFilters:function(){for(var a,b=this.filter,a=0;a<b.length;a++)b[a].destroy&&b[a].destroy();this.filter=[]},removeFilter:function(a){for(var b,c=this.filter,d=[],b=0;b<c.length;b++)c[b].tag&&c[b].tag==a||a===c[b]?c[b].destroy&&c[b].destroy():d.push(c[b]);this.filter=d},runFilters:function(a,b){for(var c=0;c<this.filter.length;c++)a=this.filter[c].filter(a,b,this);return a},endDrag:function(){this.state&&(a(document.body).off(".jcrop"),this.focus(),this.state=null)},startDrag:function(c,d){var e=this;e.core;return d=d||a(c.target).data("ord"),this.focus(),"move"==d&&e.element.hasClass(e.core.opt.css_nodrag)?!1:(this.state=new b.component.DragState(c,this,d),!1)},allowSelect:function(a){return void 0===a&&(a=this.canSelect),a&&this.canSelect?this.frame.attr("disabled",!1):this.frame.attr("disabled","disabled"),this},allowDrag:function(a){var b=this,c=b.core.opt;return void 0==a&&(a=b.canDrag),a&&b.canDrag?b.element.removeClass(c.css_nodrag):b.element.addClass(c.css_nodrag),this},allowResize:function(a){var b=this,c=b.core.opt;return void 0==a&&(a=b.canResize),a&&b.canResize?b.element.removeClass(c.css_noresize):b.element.addClass(c.css_noresize),this},remove:function(){this.element.trigger("cropremove",this),this.element.remove()},toBack:function(){this.active=!1,this.element.removeClass("jcrop-current jcrop-focus")},toFront:function(){this.active=!0,this.element.addClass("jcrop-current"),this.callFilterFunction("refresh"),this.refresh()},redraw:function(a){return this.moveTo(a.x,a.y),this.resize(a.w,a.h),this.last=a,this},update:function(a,b){return this.updateRaw(this.core.scale(a),b)},updateRaw:function(a,b){return a=this.runFilters(a,b),this.redraw(a),this.element.trigger("cropmove",[this,this.core.unscale(a)]),this},animateTo:function(a,c){var d=new b.component.Animator(this),e=this.core.scale(b.wrapFromXywh(a));d.animate(e.x,e.y,e.w,e.h,c)},center:function(a){var b=this.get(),c=this.core,d=c.container.width(),e=c.container.height(),f=[(d-b.w)/2,(e-b.h)/2,b.w,b.h];return this[a?"setSelect":"animateTo"](f)},createElement:function(b,c){return a("<div />").addClass(b+" ord-"+c).data("ord",c)},moveTo:function(a,b){this.element.css({top:b+"px",left:a+"px"})},blur:function(){return this.element.blur(),this},focus:function(){return this.core.setSelection(this),this.frame.focus(),this},resize:function(a,b){this.element.css({width:a+"px",height:b+"px"})},get:function(){var a=this.element,b=a.position(),c=a.width(),d=a.height(),e={x:b.left,y:b.top};return e.x2=e.x+c,e.y2=e.y+d,e.w=c,e.h=d,e},insertElements:function(){var a,b=this,c=(b.core,b.element),d=b.core.opt,e=d.borders,f=d.handles,g=d.dragbars;for(a=0;a<g.length;a++)c.append(b.createElement(d.css_dragbars,g[a]));for(a=0;a<f.length;a++)c.append(b.createElement(d.css_handles,f[a]));for(a=0;a<e.length;a++)c.append(b.createElement(d.css_borders,e[a]))}}}),b.registerComponent("Selection",u);var v=function(b,c){a.extend(this,v.defaults,c||{}),this.manager=b,this.core=b.core};v.defaults={offset:[-8,-8],active:!0,minsize:[20,20]},a.extend(v.prototype,{start:function(c){var d=this.core;if(d.opt.allowSelect){if(d.opt.multi&&d.opt.multiMax&&d.ui.multi.length>=d.opt.multiMax)return!1;var e=a(c.currentTarget).offset(),f=c.pageX-e.left+this.offset[0],g=c.pageY-e.top+this.offset[1],h=d.ui.multi;if(!d.opt.multi)if(d.opt.multiCleanup){for(var i=0;i<h.length;i++)h[i].remove();d.ui.multi=[]}else d.removeSelection(d.ui.selection);d.container.addClass("jcrop-dragging");var j=d.newSelection().updateRaw(b.wrapFromXywh([f,g,1,1]));return j.element.trigger("cropstart",[j,this.core.unscale(j.get())]),j.startDrag(c,"se")}},end:function(a,b){this.drag(a,b);var c=this.sel.get();this.core.container.removeClass("jcrop-dragging"),c.w<this.minsize[0]||c.h<this.minsize[1]?this.core.requestDelete():this.sel.focus()}}),b.registerComponent("StageDrag",v);var w=function(a){this.core=a,this.ui=a.ui,this.init()};a.extend(w.prototype,{init:function(){this.setupEvents(),this.dragger=new v(this)},tellConfigUpdate:function(a){for(var b=0,c=this.ui.multi,d=c.length;d>b;b++)c[b].setOptions&&(c[b].linked||this.core.opt.linkCurrent&&c[b]==this.ui.selection)&&c[b].setOptions(a)},startDragHandler:function(){var a=this;return function(b){return!b.button||a.core.opt.is_ie_lt9?a.dragger.start(b):void 0}},removeEvents:function(){this.core.event.off(".jcrop-stage"),this.core.container.off(".jcrop-stage")},shimLegacyHandlers:function(b){var c,d=this.core;a.each(d.opt.legacyHandlers,function(a,e){a in b&&(c=b[a],d.container.off(".jcrop-"+a).on(e+".jcrop.jcrop-"+a,function(a,b,e){c.call(d,e)}),delete b[a])})},setupEvents:function(){var a=this,b=a.core;b.event.on("configupdate.jcrop-stage",function(c){a.shimLegacyHandlers(b.opt),a.tellConfigUpdate(b.opt),b.container.trigger("cropconfig",[b,b.opt])}),this.core.container.on("mousedown.jcrop.jcrop-stage",this.startDragHandler())}}),b.registerComponent("StageManager",w);var x=function(){};a.extend(x,{defaults:{selection:null,fading:!0,fadeDelay:1e3,fadeDuration:1e3,autoHide:!1,width:80,height:80,_hiding:null},prototype:{recopyCanvas:function(){var a=this.core.ui.stage,b=a.context;this.context.putImageData(b.getImageData(0,0,a.canvas.width,a.canvas.height),0,0)},init:function(b,c){var d=this;this.core=b,a.extend(this,x.defaults,c),d.initEvents(),d.refresh(),d.insertElements(),d.selection?(d.renderSelection(d.selection),d.selectionTarget=d.selection.element[0]):d.core.ui.selection&&d.renderSelection(d.core.ui.selection),d.core.ui.stage.canvas&&(d.context=d.preview[0].getContext("2d"),d.core.container.on("cropredraw",function(a){d.recopyCanvas(),d.refresh()}))},updateImage:function(b){return this.preview.remove(),this.preview=a(a.Jcrop.imageClone(b)),this.element.append(this.preview),this.refresh(),this},insertElements:function(){this.preview=a(a.Jcrop.imageClone(this.core.ui.stage.imgsrc)),this.element=a("<div />").addClass("jcrop-thumb").width(this.width).height(this.height).append(this.preview).appendTo(this.core.container)},resize:function(a,b){this.width=a,this.height=b,this.element.width(a).height(b),this.renderCoords(this.last)},refresh:function(){this.cw=this.core.opt.xscale*this.core.container.width(),this.ch=this.core.opt.yscale*this.core.container.height(),this.last&&this.renderCoords(this.last)},renderCoords:function(a){var b=this.width/a.w,c=this.height/a.h;return this.preview.css({width:Math.round(b*this.cw)+"px",height:Math.round(c*this.ch)+"px",marginLeft:"-"+Math.round(b*a.x)+"px",marginTop:"-"+Math.round(c*a.y)+"px"}),this.last=a,this},renderSelection:function(a){return this.renderCoords(a.core.unscale(a.get()))},selectionStart:function(a){this.renderSelection(a)},show:function(){this._hiding&&clearTimeout(this._hiding),this.fading?this.element.stop().animate({opacity:1},{duration:80,queue:!1}):this.element.stop().css({opacity:1})},hide:function(){var a=this;a.fading?a._hiding=setTimeout(function(){a._hiding=null,a.element.stop().animate({opacity:0},{duration:a.fadeDuration,queue:!1})},a.fadeDelay):a.element.hide()},initEvents:function(){var a=this;a.core.container.on("croprotstart croprotend cropimage cropstart cropmove cropend",function(b,c,d){if(a.selectionTarget&&a.selectionTarget!==b.target)return!1;switch(b.type){case"cropimage":a.updateImage(d);break;case"cropstart":a.selectionStart(c);case"croprotstart":a.show();break;case"cropend":a.renderCoords(d);case"croprotend":a.autoHide&&a.hide();break;case"cropmove":a.renderCoords(d)}})}}}),b.registerComponent("Thumbnailer",x);var y=function(){};y.prototype={init:function(b,c,d){c||(c=b.container),this.$btn=a(c),this.$targ=a(c),this.core=b,this.$btn.addClass("dialdrag").on("mousedown.dialdrag",this.mousedown()).data("dialdrag",this),a.isFunction(d)||(d=function(){}),this.callback=d,this.ondone=d},remove:function(){return this.$btn.removeClass("dialdrag").off(".dialdrag").data("dialdrag",null),this},setTarget:function(b){return this.$targ=a(b),this},getOffset:function(){var a=this.$targ,b=a.offset();return[b.left+a.width()/2,b.top+a.height()/2]},relMouse:function(a){var b=a.pageX-this.offset[0],c=a.pageY-this.offset[1],d=Math.atan2(c,b)*(180/Math.PI),e=Math.sqrt(Math.pow(b,2)+Math.pow(c,2));return[b,c,d,e]},mousedown:function(){function b(b){a(window).off(".dialdrag"),d.ondone.call(d,d.relMouse(b)),d.core.container.trigger("croprotend")}function c(a){d.callback.call(d,d.relMouse(a))}var d=this;return function(e){d.offset=d.getOffset();var f=d.relMouse(e);return d.angleOffset=-d.core.ui.stage.angle+f[2],d.distOffset=f[3],d.dragOffset=[f[0],f[1]],d.core.container.trigger("croprotstart"),a(window).on("mousemove.dialdrag",c).on("mouseup.dialdrag",b),d.callback.call(d,d.relMouse(e)),!1}}},b.registerComponent("DialDrag",y),b.defaults={edge:{n:0,s:0,e:0,w:0},setSelect:null,linked:!0,linkCurrent:!0,canDelete:!0,canSelect:!0,canDrag:!0,canResize:!0,eventManagerComponent:b.component.EventManager,keyboardComponent:b.component.Keyboard,dragstateComponent:b.component.DragState,stagemanagerComponent:b.component.StageManager,animatorComponent:b.component.Animator,selectionComponent:b.component.Selection,stageConstructor:b.stageConstructor,allowSelect:!0,multi:!1,multiMax:!1,multiCleanup:!0,animation:!0,animEasing:"swing",animDuration:400,fading:!0,fadeDuration:300,fadeEasing:"swing",bgColor:"black",bgOpacity:.5,applyFilters:["constrain","extent","backoff","ratio","shader","round"],borders:["e","w","s","n"],handles:["n","s","e","w","sw","ne","nw","se"],dragbars:["n","e","w","s"],dragEventTarget:window,xscale:1,yscale:1,boxWidth:null,boxHeight:null,css_nodrag:"jcrop-nodrag",css_drag:"jcrop-drag",css_container:"jcrop-active",css_shades:"jcrop-shades",css_selection:"jcrop-selection",css_borders:"jcrop-border",css_handles:"jcrop-handle jcrop-drag",css_button:"jcrop-box jcrop-drag",css_noresize:"jcrop-noresize",css_dragbars:"jcrop-dragbar jcrop-drag",legacyHandlers:{onChange:"cropmove",onSelect:"cropend"}},a.extend(b.prototype,{init:function(){this.event=new this.opt.eventManagerComponent(this),this.ui.keyboard=new this.opt.keyboardComponent(this),this.ui.manager=new this.opt.stagemanagerComponent(this),this.applyFilters(),a.Jcrop.supportsTouch&&new a.Jcrop.component.Touch(this),this.initEvents()},applySizeConstraints:function(){var c=this.opt,d=this.opt.imgsrc;if(d){var e=d.naturalWidth||d.width,f=d.naturalHeight||d.height,g=c.boxWidth||e,h=c.boxHeight||f;if(d&&(e>g||f>h)){var i=b.getLargestBox(e/f,g,h);a(d).width(i[0]).height(i[1]),this.resizeContainer(i[0],i[1]),this.opt.xscale=e/i[0],this.opt.yscale=f/i[1]}}if(this.opt.trueSize){var j=this.opt.trueSize[0],k=this.opt.trueSize[1],l=this.getContainerSize();this.opt.xscale=j/l[0],this.opt.yscale=k/l[1]}},initComponent:function(a){if(b.component[a]){var c=Array.prototype.slice.call(arguments),d=new b.component[a];return c.shift(),c.unshift(this),d.init.apply(d,c),d}},setOptions:function(b,c){return a.isPlainObject(b)||(b={}),a.extend(this.opt,b),this.opt.setSelect&&(this.ui.multi.length||this.newSelection(),this.setSelect(this.opt.setSelect),this.opt.setSelect=null),this.event.trigger("configupdate"),this},destroy:function(){this.opt.imgsrc?(this.container.before(this.opt.imgsrc),this.container.remove(),a(this.opt.imgsrc).removeData("Jcrop").show()):this.container.remove()},applyFilters:function(){for(var b,c=0,d=this.opt.applyFilters,e=d.length;e>c;c++)a.Jcrop.filter[d[c]]&&(b=new a.Jcrop.filter[d[c]]),b.core=this,b.init&&b.init(),this.filter[d[c]]=b},getDefaultFilters:function(){for(var a=[],b=0,c=this.opt.applyFilters,d=c.length;d>b;b++)this.filter.hasOwnProperty(c[b])&&a.push(this.filter[c[b]]);return a.sort(function(a,b){return a.priority-b.priority}),a},setSelection:function(a){for(var b=this.ui.multi,c=[],d=0;d<b.length;d++)b[d]!==a&&c.push(b[d]),b[d].toBack();return c.unshift(a),this.ui.multi=c,this.ui.selection=a,a.toFront(),a},getSelection:function(a){var b=this.ui.selection.get();return b},newSelection:function(a){return a||(a=new this.opt.selectionComponent),a.init(this),this.setSelection(a),a},hasSelection:function(a){for(var b=0;b<this.ui.multi;b++)if(a===this.ui.multi[b])return!0},removeSelection:function(a){for(var b,c=[],d=this.ui.multi,b=0;b<d.length;b++)a!==d[b]?c.push(d[b]):d[b].remove();return this.ui.multi=c},addFilter:function(a){for(var b=0,c=this.ui.multi,d=c.length;d>b;b++)c[b].addFilter(a);return this},removeFilter:function(a){for(var b=0,c=this.ui.multi,d=c.length;d>b;b++)c[b].removeFilter(a);return this},blur:function(){return this.ui.selection.blur(),this},focus:function(){return this.ui.selection.focus(),this},initEvents:function(){var a=this;a.container.on("selectstart",function(a){return!1}).on("mousedown","."+a.opt.css_drag,a.startDrag())},maxSelect:function(){this.setSelect([0,0,this.elw,this.elh])},nudge:function(a,b){var c=this.ui.selection,d=c.get();d.x+=a,d.x2+=a,d.y+=b,d.y2+=b,d.x<0?(d.x2=d.w,d.x=0):d.x2>this.elw&&(d.x2=this.elw,d.x=d.x2-d.w),d.y<0?(d.y2=d.h,d.y=0):d.y2>this.elh&&(d.y2=this.elh,d.y=d.y2-d.h),c.element.trigger("cropstart",[c,this.unscale(d)]),c.updateRaw(d,"move"),c.element.trigger("cropend",[c,this.unscale(d)])},refresh:function(){for(var a=0,b=this.ui.multi,c=b.length;c>a;a++)b[a].refresh()},blurAll:function(){for(var a=this.ui.multi,b=0;b<a.length;b++)a[b]!==sel&&n.push(a[b]),a[b].toBack()},scale:function(a){var b=this.opt.xscale,c=this.opt.yscale;return{x:a.x/b,y:a.y/c,x2:a.x2/b,y2:a.y2/c,w:a.w/b,h:a.h/c}},unscale:function(a){var b=this.opt.xscale,c=this.opt.yscale;return{x:a.x*b,y:a.y*c,x2:a.x2*b,y2:a.y2*c,w:a.w*b,h:a.h*c}},requestDelete:function(){return this.ui.multi.length>1&&this.ui.selection.canDelete?this.deleteSelection():void 0},deleteSelection:function(){this.ui.selection&&(this.removeSelection(this.ui.selection),this.ui.multi.length&&this.ui.multi[0].focus(),this.ui.selection.refresh())},animateTo:function(a){return this.ui.selection&&this.ui.selection.animateTo(a),this},setSelect:function(a){return this.ui.selection&&this.ui.selection.update(b.wrapFromXywh(a)),this},startDrag:function(){var b=this;return function(c){var d=a(c.target),e=d.closest("."+b.opt.css_selection).data("selection"),f=d.data("ord");return b.container.trigger("cropstart",[e,b.unscale(e.get())]),e.startDrag(c,f),!1}},getContainerSize:function(){return[this.container.width(),this.container.height()]},resizeContainer:function(a,b){this.container.width(a).height(b),this.refresh()},setImage:function(b,c){var d=this,e=d.opt.imgsrc;return e?void new a.Jcrop.component.ImageLoader(b,null,function(f,g){d.resizeContainer(f,g),e.src=b,a(e).width(f).height(g),d.applySizeConstraints(),d.refresh(),d.container.trigger("cropimage",[d,e]),"function"==typeof c&&c.call(d,f,g)}):!1},update:function(a){this.ui.selection&&this.ui.selection.update(a)}}),a.fn.Jcrop=function(b,c){b=b||{};var d=this.eq(0).data("Jcrop"),e=Array.prototype.slice.call(arguments);return"api"==b?d:d&&"string"==typeof b?d[b]?(e.shift(),d[b].apply(d,e),d):!1:void this.each(function(){var d=a(this),e=d.data("Jcrop");return e?e.setOptions(b):(b.stageConstructor||(b.stageConstructor=a.Jcrop.stageConstructor),b.stageConstructor(this,b,function(b,e){var f=e.setSelect;f&&delete e.setSelect;var g=a.Jcrop.attach(b.element,e);"function"==typeof b.attach&&b.attach(g),d.data("Jcrop",g),f&&(g.newSelection(),g.setSelect(f)),"function"==typeof c&&c.call(g)})),this})};var z=function(a,b,c){function d(a){r.cssText=a}function e(a,b){return typeof a===b}function f(a,b){return!!~(""+a).indexOf(b)}function g(a,b){for(var d in a){var e=a[d];if(!f(e,"-")&&r[e]!==c)return"pfx"==b?e:!0}return!1}function h(a,b,d){for(var f in a){var g=b[a[f]];if(g!==c)return d===!1?a[f]:e(g,"function")?g.on(d||b):g}return!1}function i(a,b,c){var d=a.charAt(0).toUpperCase()+a.slice(1),f=(a+" "+v.join(d+" ")+d).split(" ");return e(b,"string")||e(b,"undefined")?g(f,b):(f=(a+" "+w.join(d+" ")+d).split(" "),h(f,b,c))}var j,k,l,m="2.7.1",n={},o=b.documentElement,p="modernizr",q=b.createElement(p),r=q.style,s={}.toString,t=" -webkit- -moz- -o- -ms- ".split(" "),u="Webkit Moz O ms",v=u.split(" "),w=u.toLowerCase().split(" "),x={svg:"http://www.w3.org/2000/svg"},y={},z=[],A=z.slice,B=function(a,c,d,e){var f,g,h,i,j=b.createElement("div"),k=b.body,l=k||b.createElement("body");if(parseInt(d,10))for(;d--;)h=b.createElement("div"),h.id=e?e[d]:p+(d+1),j.appendChild(h);return f=["&#173;",'<style id="s',p,'">',a,"</style>"].join(""),j.id=p,(k?j:l).innerHTML+=f,l.appendChild(j),k||(l.style.background="",l.style.overflow="hidden",i=o.style.overflow,o.style.overflow="hidden",o.appendChild(l)),g=c(j,a),k?j.parentNode.removeChild(j):(l.parentNode.removeChild(l),o.style.overflow=i),!!g},C=function(){function a(a,f){f=f||b.createElement(d[a]||"div"),a="on"+a;var g=a in f;return g||(f.setAttribute||(f=b.createElement("div")),f.setAttribute&&f.removeAttribute&&(f.setAttribute(a,""),g=e(f[a],"function"),e(f[a],"undefined")||(f[a]=c),f.removeAttribute(a))),f=null,g}var d={select:"input",change:"input",submit:"form",reset:"form",error:"img",load:"img",abort:"img"};return a}(),D={}.hasOwnProperty;l=e(D,"undefined")||e(D.call,"undefined")?function(a,b){return b in a&&e(a.constructor.prototype[b],"undefined")}:function(a,b){return D.call(a,b)},Function.prototype.bind||(Function.prototype.bind=function(a){var b=this;if("function"!=typeof b)throw new TypeError;var c=A.call(arguments,1),d=function(){if(this instanceof d){var e=function(){};e.prototype=b.prototype;var f=new e,g=b.apply(f,c.concat(A.call(arguments)));return Object(g)===g?g:f}return b.apply(a,c.concat(A.call(arguments)))};return d}),y.canvas=function(){var a=b.createElement("canvas");return!(!a.getContext||!a.getContext("2d"))},y.canvastext=function(){return!(!n.canvas||!e(b.createElement("canvas").getContext("2d").fillText,"function"))},y.touch=function(){var c;return"ontouchstart"in a||a.DocumentTouch&&b instanceof DocumentTouch?c=!0:B(["@media (",t.join("touch-enabled),("),p,")","{#modernizr{top:9px;position:absolute}}"].join(""),function(a){c=9===a.offsetTop}),c},y.draganddrop=function(){var a=b.createElement("div");return"draggable"in a||"ondragstart"in a&&"ondrop"in a},y.csstransforms=function(){return!!i("transform")},y.svg=function(){return!!b.createElementNS&&!!b.createElementNS(x.svg,"svg").createSVGRect},y.inlinesvg=function(){var a=b.createElement("div");return a.innerHTML="<svg/>",(a.firstChild&&a.firstChild.namespaceURI)==x.svg},y.svgclippaths=function(){return!!b.createElementNS&&/SVGClipPath/.test(s.call(b.createElementNS(x.svg,"clipPath")))};for(var E in y)l(y,E)&&(k=E.toLowerCase(),n[k]=y[E](),z.push((n[k]?"":"no-")+k));return n.addTest=function(a,b){if("object"==typeof a)for(var d in a)l(a,d)&&n.addTest(d,a[d]);else{if(a=a.toLowerCase(),n[a]!==c)return n;b="function"==typeof b?b():b,"undefined"!=typeof enableClasses&&enableClasses&&(o.className+=" "+(b?"":"no-")+a),n[a]=b}return n},d(""),q=j=null,n._version=m,n._prefixes=t,n._domPrefixes=w,n._cssomPrefixes=v,n.hasEvent=C,n.testProp=function(a){return g([a])},n.testAllProps=i,n.testStyles=B,n}(window,window.document);!function(){var a=new Image;a.onerror=function(){z.addTest("datauri",function(){return!1})},a.onload=function(){z.addTest("datauri",function(){return 1==a.width&&1==a.height})},a.src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="}(),a.Jcrop=b,a.Jcrop.supportsCanvas=z.canvas,a.Jcrop.supportsCanvasText=z.canvastext,a.Jcrop.supportsDragAndDrop=z.draganddrop,a.Jcrop.supportsDataURI=z.datauri,a.Jcrop.supportsSVG=z.svg,a.Jcrop.supportsInlineSVG=z.inlinesvg,a.Jcrop.supportsSVGClipPaths=z.svgclippaths,a.Jcrop.supportsCSSTransforms=z.csstransforms,a.Jcrop.supportsTouch=z.touch}(jQuery);
