// (c) Copyright 2009 Jaded Pixel. Author: Caroline Schnapp. All Rights Reserved.

if ((typeof Shopify) === 'undefined') {
  Shopify = {};
}

/* 

Override so that Shopify.formatMoney returns pretty 
money values instead of cents.

*/

Shopify.money_format = '$ {{amount}}';

/* 

Events (override!)

Example override:
  ... add to your theme.liquid's script tag....

  Shopify.onItemAdded = function(line_item) {
    $('message').update('Added '+line_item.title + '...');
  }
*/

Shopify.onError = function(XMLHttpRequest, textStatus) {
  // Shopify returns a description of the error in XMLHttpRequest.responseText.
  // It is JSON.
  var data = eval('(' + XMLHttpRequest.responseText + ')');
  alert(data.message + '(' + data.status  + '): ' + data.description);
};

Shopify.onCartUpdate = function(cart) {
  alert("There are now "+ cart.item_count + " items in the cart.");
};  

Shopify.onItemAdded = function(line_item) {
  alert(line_item.title + ' Was added to your shopping cart');
};

Shopify.onProduct = function(product) {
  alert('Received everything we ever wanted to know about '+ product.title);
};

/* Tools */

Shopify.formatMoney = function(cents, format) {
  var value = '';
  var patt = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = (format || this.money_format);
  switch(formatString.match(patt)[1]) {
  case 'amount':
    value = floatToString(cents/100.0, 2);
    break;
  case 'amount_no_decimals':
    value = floatToString(cents/100.0, 0);
    break;
	case 'amount_with_comma_separator':
		value = floatToString(cents/100.0, 2).replace(/\./, ',');
		break;
  }    
  return formatString.replace(patt, value);
};

Shopify.resizeImage = function(image, size) {
  try {
    if(size == 'original') { return image; }
    else {      
      var matches = image.match(/(.*\/[\w\-\_\.]+)\.(\w{2,4})/);
      return matches[1] + '_' + size + '.' + matches[2];
    }    
  } catch (e) { return image; }
};
/* API */
  
Shopify.addItem = function(variant_id, quantity, callback) {
  var quantity = quantity || 1;
	var params = {
  	type: 'POST',
  	url: '/cart/add.js',
  	data: 'quantity='+quantity+'&id='+variant_id,
  	dataType: 'json',
  	success: function(response) { 
			if ((typeof callback) === 'function') {
				callback(response);
			}
			else {
				Shopify.onItemAdded(response);
			}
		},
    error: function(XMLHttpRequest, textStatus) {
		  Shopify.onError(XMLHttpRequest, textStatus);
		}		
	};
  jQuery.ajax(params);
};

Shopify.addItemFromForm = function(form_id, callback) {
		var params = {
			type: 'POST',
			url: '/cart/add.js',
			data: jQuery('#' + form_id).serialize(),
			dataType: 'json',
			success: function(cart) { 
				if ((typeof callback) === 'function') {
					callback(cart);
				}
				else {
					Shopify.onItemAdded(cart);
				}
			},
  		error: function(XMLHttpRequest, textStatus) {
	  		Shopify.onError(XMLHttpRequest, textStatus);
			}		
		};
		jQuery.ajax(params);
};

Shopify.getCart = function(callback) {
  jQuery.getJSON('/cart.js', function (cart, textStatus) {
	  if ((typeof callback) === 'function') {
			callback(cart);
		}
		else {
			Shopify.onCartUpdate(cart);
		}	  
	});	
};  

Shopify.getProduct = function(handle, callback) {
  jQuery.getJSON('/products/'+handle+'.js', function (product, textStatus) {
	  if ((typeof callback) === 'function') {
			callback(product);
		}
		else {
			Shopify.onProduct(product);
		}	
	});
};

Shopify.changeItem = function(variant_id, quantity) {
	var params = {
		type: 'POST',
		url: '/cart/change.js',
		data:  'quantity='+quantity+'&id='+variant_id,
		dataType: 'json',
		success: function(cart) { 
			if ((typeof callback) === 'function') {
				callback(cart);
			}
			else {
				Shopify.onCartUpdate(cart);
			}
		},
		error: function(XMLHttpRequest, textStatus) {
  		Shopify.onError(XMLHttpRequest, textStatus);
		}
	};
	jQuery.ajax(params);            
};

Shopify.removeItem = function(variant_id) {
	var params = {
		type: 'POST',
		url: '/cart/change.js',
		data:  'quantity=0&id='+variant_id,
		dataType: 'json',
		success: function(cart) { 
			if ((typeof callback) === 'function') {
				callback(cart);
			}
			else {
				Shopify.onCartUpdate(cart);
			}
		},
		error: function(XMLHttpRequest, textStatus) {
  		Shopify.onError(XMLHttpRequest, textStatus);
		}
	};
	jQuery.ajax(params);
};

Shopify.clear = function() {
	var params = {
		type: 'POST',
		url: '/cart/clear.js',
		data:  '',
		dataType: 'json',
		success: function(cart) { 
			if ((typeof callback) === 'function') {
				callback(cart);
			}
			else {
				Shopify.onCartUpdate(cart);
			}
		},
		error: function(XMLHttpRequest, textStatus) {
  		Shopify.onError(XMLHttpRequest, textStatus);
		}
	};
	jQuery.ajax(params);
};

Shopify.updateCartFromForm = function(form_id, callback) {
	var params = {
		type: 'POST',
		url: '/cart/update.js',
		data: jQuery('#' + form_id).serialize(),
		dataType: 'json',
		success: function(cart) {
			if ((typeof callback) === 'function') {
				callback(cart);
			}
			else {
				Shopify.onCartUpdate(cart);
			}
		},
		error: function(XMLHttpRequest, textStatus) {
  		Shopify.onError(XMLHttpRequest, textStatus);
		}
	};
	jQuery.ajax(params);
};

/* Used by Tools */

function floatToString(numeric, decimals) {
  var amount = numeric.toFixed(decimals).toString();
  if(amount.match(/^\.\d+/)) {return "0"+amount; }
  else { return amount; }
}