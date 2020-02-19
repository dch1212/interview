
/* 实现一个函数 findLastIndex(), 返回指定数在“有序”数组中最后一次出现位置的索引
 * 如findLastIndex([1,2,3,3,3,4,5], 3), 返回4
 */
 ================================================ ================================================ ================================================
 请实现一个cacheRequest方法，保证当使用ajax时，真实网络层中，实际只发出一次请求（假设已存在request方法用于封装ajax请求，调用格式为：request(url, successCallback, failCallback)）

比如调用方代码（并行请求）如下

// a.js
cacheRequest('/user', data => {
console.log('我是从A中请求的user，数据为' + data);
})
// b.js
cacheRequest('/user', data => {
console.log('我是从B中请求的user，数据为' + data);
}
 ================================================ ================================================ ================================================
手写instance
手写Promise.all
URLCache

1. 介绍 balabala
2. 手写 Promise
3. 实现 a，使得 a.get('a').set('b') 输出 'a get a and set b'
4. 实现同时发出 100 个请求，每 10 个返回，返回一个百分比
5. 实现一个简易 TODO List
6. 我说我实现过 JSBridge 他问我微信小程序的
7. 还有一个 Vue 的生命周期，和父子组件的 created 和 mounted 顺序
8. Vue render 函数做了哪些事儿

 ================================================ ================================================ ================================================
let length = 10
function fn(){console.log(this.length)}
let obj = {
  length: 5,
  method(fn){
    fn()
    arguments[0]()
  }
}

obj.method(fn, 1)

 ================================================  ================================================  ================================================
let a = 0;
let obj = {
    a: 1,
    b: this.a,
    c: function() {
        return this.a;
    },
    d: () => {
        return this.a;
    }
}

obj.b;
obj.c();
obj.d();
 ================================================ ================================================ ================================================
document.body.addEventListener('click', () => {
Promise.resolve().then(() => console.log(1))
console.log(2);
}, false)

document.body.addEventListener('click', () => {
Promise.resolve().then(() => console.log(3))
console.log(4);
}, false)

document.body.click();

 ================================================ ================================================ ================================================
var name = 'window';
var bar = { name: 'bar' };

var foo = {
    name: 'foo',
    say2: () => {
       console.log(this.name);
    },
    say3: function () {
         return () => {
             log(this.name);
         }
    }
}

foo.say2();
foo.say2.call(bar);

foo.say3()();
foo.say3().call(bar);
foo.say3.call(bar)();

 ================================================ ================================================ ================================================
console.log(a);
var a = 1;
function a () { log(1) };
a=2
a();
