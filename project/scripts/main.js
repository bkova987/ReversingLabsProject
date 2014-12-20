$(document).ready(function(){

$('#search_div').hide();

var seek = 0;
var file_size=[];
var fileName;
var text_part;

function get_file(seek,fileName){
	   //load rfileNameeader with paramters to fetch file
	   
   $.ajax({
           url: reader+"?filename="+fileName+"&seek="+seek+"&size=1024",
           type: "GET",
           dataType: "binary"
           }).done(function(data) {
           var fileReader = new FileReader();
           fileReader.onload = function() {
           var bin = new Uint8Array(this.result);
           var size = bin.length;
		   var raws = Math.round(size/16);
		   var file_data = [];
		   var file_text = [];
		   text_part = "";
		   var counter = 0;
		   file_data.push("<tr><th colspan='17' >"+fileName+" - hex</th></tr>");
		   file_text.push("<tr><th colspan='17' >"+fileName+" - text</th></tr>");
		   for(i=0;i<raws;i++){
		   file_data.push("<tr>");
		   file_text.push("<tr>");
		    for(j=0;j<16;j++){
			  if(j==8){
			  	file_data.push("<td>&nbsp&nbsp&nbsp&nbsp</td>");
				file_text.push("<td>&nbsp&nbsp&nbsp&nbsp</td>");
			  }
			  if(counter<size){

			    var hex = bin[counter].toString(16).toUpperCase();
			    var text = String.fromCharCode(bin[counter]);

			    text_part += text;
				file_data.push("<td id='h"+counter+"'>" + ("00" + hex).slice(-2)  +"</td>");
				file_text.push("<td id='t"+counter+"'>" + text  +"</td>");
				counter++;
			   }
			}
		   	file_data.push("</tr>");
			file_text.push("</tr>");
		   }
		   $('#results').empty();
           $('#results').append(file_data.join(''));
		   
		   $('#results_text').empty();
           $('#results_text').append(file_text.join(''));
		   
		   
};
fileReader.readAsArrayBuffer(data);

    var e = jQuery.Event("input");
    $("#search_item").trigger(e);
	
    }); 
	
}

//fetching reader.php file without parameters to get file names and file sizes

var reader = "http://reversinglabs.bergb.com/reader.php";

$.ajaxTransport("+binary", function(options, originalOptions, jqXHR){
// check for conditions and support for blob / arraybuffer response type
if (window.FormData && ((options.dataType && (options.dataType == 'binary')) || (options.data && ((window.ArrayBuffer && options.data instanceof ArrayBuffer) || (window.Blob && options.data instanceof Blob)))))
{
return {
// create new XMLHttpRequest
send: function(_, callback){
// setup all variables
var xhr = new XMLHttpRequest(),
url = options.url,
type = options.type,
// blob or arraybuffer. Default is blob
dataType = options.responseType || "blob",
data = options.data || null;
xhr.addEventListener('load', function(){
var data = {};
data[options.dataType] = xhr.response;
// make callback and send data
callback(xhr.status, xhr.statusText, data, xhr.getAllResponseHeaders());
});
 
xhr.open(type, url, true);
xhr.responseType = dataType;
xhr.send(data);
},
abort: function(){
jqXHR.abort();
}
};
}
});

$.getJSON(reader, function(data) {
var items = [];
$.each(data, function(key, val) {
    file_size[val['filename']] = val['size'];
	items.push("<li><a id='"+val['filename']+"' href='' >"+val['filename']+" size("+file_size[val['filename']]+" bytes)</a></li>");
});
    $('#file_list').empty();
    $('#file_list').append(items.join(''));
	
});

	
	//click on list link event

   $(document).on("click","#file_list li a",function(event){
	   
   fileName = $(this).attr("id");

   seek = 0;
  get_file(seek,fileName);
   $('#search_div').show();
   event.preventDefault();

});

//on table element hover


  $(document).on("mouseover","#results tr td[id*='h']",function(event){
  var id = $(this).attr("id");
  var num = id.substring(1);
   $(this).addClass("selected");
  $("#results_text tr td[id='t"+num+"']").addClass("selected");
 
  });
  
   $(document).on("mouseleave","#results tr td[id*='h']",function(event){
  var id = $(this).attr("id");
  var num = id.substring(1);
   $(this).removeClass("selected");
  $("#results_text tr td[id='t"+num+"']").removeClass("selected");
 
  });
  
   $(document).on("mouseover","#results_text tr td[id*='t']",function(event){
  var id = $(this).attr("id");
  var num = id.substring(1);
  $(this).addClass("selected");
  $("#results tr td[id='h"+num+"']").addClass("selected");
 
  });
  
   $(document).on("mouseleave","#results_text tr td[id*='t']",function(event){
  var id = $(this).attr("id");
  var num = id.substring(1);
   $(this).removeClass("selected");
  $("#results tr td[id='h"+num+"']").removeClass("selected");
 
  });
  
  
  //scroll event
  
  var _throttleTimer = null;
var _throttleDelay = 200;
  
  $("#main_part").scroll(function(event){
	     clearTimeout(_throttleTimer);
    _throttleTimer = setTimeout(function () {

      if($("#main_part")[0].scrollHeight - $("#main_part")[0].scrollTop === $("#main_part")[0].clientHeight)  {
         seek = parseInt(seek, 10) + 1024;
         file_size[fileName] = parseInt(file_size[fileName],10);
         if(seek<file_size[fileName]){
	         get_file(seek,fileName);

       }else{
         	seek-=1024;
       }
        var pos = $("#main_part").scrollTop()-10;
        $("#main_part").scrollTop(pos);
      }else if($("#main_part").scrollTop() == 0){
  	    seek = parseInt(seek, 10) - 1024;
	    if(seek >= 0){
		    get_file(seek,fileName);
	    }else{
	        seek+=1024; 
	     }
	     $("#main_part").scrollTop(10);
      }

    }, _throttleDelay); 

   });

   
  $(document).on("click","#go_down",function(event){
   seek = parseInt(seek, 10) + 1024;
   file_size[fileName] = parseInt(file_size[fileName],10);
   if(seek<file_size[fileName]){
    $('#main_part').effect( "fade", "", 500, function(){ $( '#main_part' ).fadeIn();} );
      setTimeout(function(){
	    get_file(seek,fileName);
	 },500);
   }else{
   	seek-=1024;
   }
  });
  $(document).on("click","#go_up",function(event){
   seek = parseInt(seek, 10) - 1024;
	if(seek >= 0){
	 $('#main_part').effect( "fade", "", 500, function(){$( '#main_part' ).fadeIn();} );
	 setTimeout(function(){
	  get_file(seek,fileName);
	 },500);
	
	}else{
	seek+=1024; 	
	}
   });
   
   //fire search event
  
   var id,num;
   $('#search_item').on("input",function(){
      setTimeout(function(){
	   var s_type = $('input[name=search_type_name]:checked').val();
	   var s_value = $('#search_item').val();
	   if(s_value != ""){
	   if(s_type == "hex"){
		$("#results tr td").removeClass("selected_search");
	    $("#results_text tr td").removeClass("selected_search");
	  	$("#results tr td:contains('"+s_value+"')").addClass("selected_search");
		$("#results tr td:contains('"+s_value+"')").each(function(){
			id = $(this).attr("id");
			num = id.substring(1);
			$("#results_text tr td[id=t"+num+"]").addClass("selected_search");
		});
		$("#results tr td:not(:contains('"+s_value+"'))").removeClass("selected_search");
		$("#results tr td:not(:contains('"+s_value+"'))").each(function(){
			id = $(this).attr("id");
			num = id.substring(1);
			$("#results_text tr td[id=t"+num+"]").removeClass("selected_search");
		});
	    }else{
		     $("#results tr td").removeClass("selected_search");
	         $("#results_text tr td").removeClass("selected_search");
			 var start_pos = 0;
             var j = -1;
			 while (start_pos != -1) {
                start_pos = text_part.indexOf(s_value,j+1);
	            if(start_pos != -1){
			         for(i=0;i<s_value.length;i++){
					     $("#results_text tr td[id=t"+(start_pos+i)+"]").addClass("selected_search");
						 $("#results tr td[id=h"+(start_pos+i)+"]").addClass("selected_search");
			         }
					 }
                 j = start_pos;
             }
 			
		}	   	
	   }else{
	   	$("#results tr td").removeClass("selected_search");
	    $("#results_text tr td").removeClass("selected_search");
	   }
	   
	    
	 },500);
     
   });
  
});