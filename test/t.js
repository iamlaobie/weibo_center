var s = "1,2,3,4";
var r = s.match(/\d+/g);
r.forEach(function(x){
	console.log(x);
}, function(){
	console.log('dd');
});