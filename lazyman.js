// 实现一个LazyMan，可以按照以下方式调用:
// LazyMan("Hank")输出:
// Hi! This is Hank!
//  
// LazyMan("Hank").sleep(10).eat("dinner")输出
// Hi! This is Hank!
// //等待10秒..
// Wake up after 10
// Eat dinner~
//  
// LazyMan("Hank").eat("dinner").eat("supper")输出
// Hi This is Hank!
// Eat dinner~
// Eat supper~
//  
// LazyMan("Hank").sleepFirst(5).eat("supper")输出
// //等待5秒
// Wake up after 5
// Hi This is Hank!
// Eat supper
//  
// 以此类推。
1、
function log(str) {
    console.log(str)
}
function LazyMan(name) {
    this.sleepTime = 0;
    if(name){
        log("Hi! This is "+name);
    }else{
        console.error("Please tell me your name!")
    }
    return this;
}
LazyMan.prototype.eat = function (food) {
    var sleepTime = this.sleepTime;
    setTimeout(function () {
        if(sleepTime>0){
            log("Wake up after "+sleepTime+" s")
        }
        if(food){
            log("Eat "+food);
        }
    },this.sleepTime*1000);

    return this;
};
LazyMan.prototype.sleep = function (time) {
    this.sleepTime = time;
    return this;
};
window.lazyMan = function (name) {
    return new LazyMan(name);
};
lazyMan('Hank').sleep(5).eat('banana').sleep(10).eat('Apple');

2、
function LazyMan(name){
    　　return new _lazyman(name);
    }


    function _lazyman(name) {
    　　this.task=[];
    　　var that=this;
    　　var fn=(function(name){
    　　　　return function(){
    　　　　　　console.log("Hello I'm "+name);
    　　　　　　that.next();
    　　　　}
    　　})(name);

    　　this.task.push(fn);

    　　setTimeout(function(){that.next()},0)

    //此处用settimeout执行是因为settimeout会在同步线程都进行完了之后再执行,如果不用settimeout就会同步触发,事件还未都放在队列中,就已经开始执行了

    //关于js同步,异步,事件循环等,可以看这篇文章http://blog.csdn.net/alex8046/article/details/51914205

    }
    _lazyman.prototype={
    　　constructor:_lazyman,

    //next是实现函数在队列中顺序执行功能的函数

    　　next:function(){
    　　　　var fn=this.task.shift();
    　　　　fn&&fn();
    　　},


    　　sleep:function(time){
    　　　　var that=this;
    　　　　var fn=(function(time){
    　　　　　　return function(){
    　　　　　　　　console.log("sleep......."+time);
    　　　　　　　　setTimeout(function(){
    　　　　　　　　　　that.next();
    　　　　　　　　},time)
    　　　　　　}
    　　　　})(time);
    　　　　this.task.push(fn);

    　　　　return this;

    //return this是为了实现链式调用
    　　},


    　　sleepfirst:function(time){
    　　　　var that=this;
    　　　　var fn=(function(time){
    　　　　　　return function(){
    　　　　　　　　console.log("sleep......."+time);
    　　　　　　　　setTimeout(function(){
    　　　　　　　　　　that.next();
    　　　　　　　　　　},time)
    　　　　　　　　}
    　　　　　　})(time);
    　　　　this.task.unshift(fn);
    　　　　return this;
    　　},


    　　eat:function(something){
    　　　　var that=this;
    　　　　var fn=(function(something){
    　　　　　　　　return function(){
    　　　　　　　　console.log("Eat "+something);
    　　　　　　　　that.next();
    　　　　　　　　}
    　　　　　　})(something)
    　　　　　　this.task.push(fn);
    　　　　　　return this;
    　　　　}
    　　}
    LazyMan("Joe").sleepfirst(3000).eat("breakfast").sleep(1000).eat("dinner");
3、
(function(window, undefined){
	var taskList = [];
	// 类
	function LazyMan(){};
	LazyMan.prototype.eat = function(str){
		subscribe("eat", str);
		return this;
	};
	LazyMan.prototype.sleep = function(num){
		subscribe("sleep", num);
		return this;
	};
	LazyMan.prototype.sleepFirst = function(num){
		subscribe("sleepFirst", num);
		return this;
	};
	// 订阅
	function subscribe(){
		var param = {},
			args = Array.prototype.slice.call(arguments);
		if(args.length < 1){
			throw new Error("subscribe 参数不能为空!");
		}
		param.msg = args[0];
		param.args = args.slice(1); // 函数的参数列表
		if(param.msg == "sleepFirst"){
			taskList.unshift(param);
		}else{
			taskList.push(param);
		}
	}
	// 发布
	function publish(){
		if(taskList.length > 0){
			run(taskList.shift());
		}
	}
	// 鸭子叫
	function run(option){
		var msg = option.msg,
			args = option.args;
		switch(msg){
			case "lazyMan": lazyMan.apply(null, args);break;
			case "eat": eat.apply(null, args);break;
			case "sleep": sleep.apply(null,args);break;
			case "sleepFirst": sleepFirst.apply(null,args);break;
			default:;
		}
	}
	// 具体方法
	function lazyMan(str){
		lazyManLog("Hi!This is "+ str +"!");
		publish();
	}
	function eat(str){
		lazyManLog("Eat "+ str +"~");
		publish();
	}
	function sleep(num){
		setTimeout(function(){
			lazyManLog("Wake up after "+ num);
			publish();
		}, num*1000);

	}
	function sleepFirst(num){
		setTimeout(function(){
			lazyManLog("Wake up after "+ num);
			publish();
		}, num*1000);
	}
	// 输出文字
	function lazyManLog(str){
		console.log(str);
	}
	// 暴露接口
	window.LazyMan = function(str){
		subscribe("lazyMan", str);
		setTimeout(function(){
			publish();
		}, 0);
		return new LazyMan();
	};
})(window);
4、
function _LazyMan(name) {

    this.promiseGetters = [];

    var makePromise = function  () {
        var promiseObj = new Promise(function(resolve, reject){
            console.log("Hi! This is " + name + "!");

            resolve();
        })

        return promiseObj;
    }

    this.promiseGetters.push(makePromise);

    // 在各个Promise的then函数中，将任务序列穿起来
    var self = this;
    var sequence = Promise.resolve();
    // Promise.resolve 等价于
    // var sequence = new Promise(function (resolve, reject) {
    //     resolve();
    // })
    setTimeout(function(){
        for (var i = 0; i < self.promiseGetters.length; i++) {
            var nowPromiseGetter = self.promiseGetters[i];
            var thenFunc = (function (nowPromiseGetter) {
                return function  () {
                    return nowPromiseGetter()
                }
            })(nowPromiseGetter);

            sequence = sequence.then(thenFunc);
        };

    }, 0); // 在下一个事件循环启动任务
}

_LazyMan.prototype.eat = function(name) {
    var makePromise = function  () {
        var promiseObj = new Promise(function(resolve, reject){
            console.log("Eat " + name + "~");

            resolve();
        })

        return promiseObj;
    }

    this.promiseGetters.push(makePromise);

    return this; // 实现链式调用
}

_LazyMan.prototype.sleep = function(time) {
    var makePromise = function  () {
        var promiseObj = new Promise(function(resolve, reject){

            setTimeout(function(){

                console.log("Wake up after " + time + "s!");

                resolve();

            }, time * 1000);
        })

        return promiseObj;
    }

    this.promiseGetters.push(makePromise);

    return this;
}

/* 封装 */

function LazyMan(name){

    return new _LazyMan(name);

}

LazyMan("Hank").sleep(1).eat("dinner")
