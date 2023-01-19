/*
var f = function(){
    console.log(1+1);
    console.log(1+2);
}
var a = [f];
a[0]();

var o = {
    func: f
}

o.func();
*/
var o = {
    v1: 'v1',
    v2: 'v2',
    f1: function(){
        console.log(this.v1);
    },
    f2: function(){
        console.log(this.v2);
    }
}

o.f1();
o.f2();
