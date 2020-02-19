// 本文从 Promise 的源代码入手，分析Promise是如何实现的。并不涉及Promise如何使用.
// 适用于已经熟悉使用Promise，同时希望深入了解Promise的开发人员
// 构建
// 从package.json中不难找到build相关的命令都在从build.js中实现
// 同时分析根目录下的index.js和core.js发现，代码的引用都是lib目录，但初始的源代码中却没有这个目录，大致猜测应该是从build.js中生成的.
// ok 让我们进入build.js
// 首先分析下引用的几个库

fs - 文件操作
rimraf - 彻底删除某个文件夹的命令 相当于 rm -rf
Acorn - 一个javascript的解析器

// 进入代码，首先跳过2个函数定义 fixup/gitIdfor.
rimraf.sync(__dirname + '/lib/');
fs.mkdirSync(__dirname + '/lib/');
fs.readdirSync(__dirname + '/src').forEach(function (filename) {
  var src = fs.readFileSync(__dirname + '/src/' + filename, 'utf8');
  var out = fixup(src);
  fs.writeFileSync(__dirname + '/lib/' + filename, out);
});
// 这里代码删除并重新建立了lib目录，然后把src下的代码文件拷贝到了lib目录下。 在拷贝之前仅仅做了一次fixup的处理，这fixup中到底发生了什么？
// 首先看getIdFor， 对每个进入的name都随机生成一个对应的由下划线开头连接2位数字的随机id 并返回.
// 然后看Fixup, 对进入的代码进行分析，获得每个节点的属性，并将其名字替换为id, 这点上比较像混淆。
// 通过对代码分析也找到最终的解释：
// All `_` prefixed properties will be reduced to `_{random number}`
// at build time to obfuscate them and discourage their use.
// We don't use symbols or Object.defineProperty to fully hide them
// because the performance isn't good enough.

// build的时候会把所有的预定义的属性转变为 `_{随机数}的形式做混淆，不鼓励直接使用他们
// 我们不使用Object.defineProperty去隐藏属性因为那会降低效率
// 编译的过程到这里可以说完成了，但build.js中把上面的过程又进行了两边，额外生成了两个目录 domains 和 setimmediate。 唯一的区别是，把其中的 asap/raw库分别换成了 asap和 setImmediate
// 那这个asap/raw和asap还有setimmediate的区别是什么呢？
// 共同点，都是立即对参数中的函数进行异步调用
// 不同点:
// asap 比 setimmediate 调用更快，而且调用的时候会阻止其他事件的处理 (默认)
// asap/raw 和asap运行的原理一样，但不处理运行抛出的异常 (换来更多效率), 同时也支持不同域的事件绑定.
// setimmediate为JS自带的，但它是在当前所有I/O事件完成后去调用，速度上没有ASAP快。
// 所以Promise有额外的 'promise/domains'(支持domain) 和 'promise/setimmediate'(支持自定义setimmediate) 供调用。
// 代码

// 分析src下代码的框架， index包含了所有的库，core是Promise定义的核心文件，其余都是对Promise的扩充和适配。所以我们从core.js开始。
// 首先是对构建中分析过的asap模块的引用, 同时构建了一个空的noop函数
// 下面的注释说明了对Promise状态的可能值：
// 0 - 等待中
// 1 - 满足条件 (值为 _value)
// 2 - 拒绝条件 (值为 _value)
// 3 - 采用了另一个Promise的状态和值
// 一旦状态值不为0， 那么这个Promise将不可以被修改.
// 在正式声明Promise之前，为了减少对try catch在代码中显示，定义了几个工具函数，一起的还有LAST_ERROR和 IS_ERROR。
// getThen获取参数对象中的then属性.
// tryCallOne调用目标函数，使用一个参数
// tryCallTwo调用目标函数，使用两个参数
// 下面就是对Promise的正式声明
module.exports = Promise;
function Promise(fn) {
  if (typeof this !== 'object') {
    throw new TypeError('Promises must be constructed via new');
  }
  if (typeof fn !== 'function') {
    throw new TypeError('Promise constructor\'s argument is not a function');
  }
  this._deferredState = 0;
  this._state = 0;
  this._value = null;
  this._deferreds = null;
  if (fn === noop) return;
  doResolve(fn, this);
}
// 函数Promise接受一个函数作为其参数，必须通过new来创建。
// 初始化 _deferredState 和 _state为 0, _value和_deferreds为null,
// 如果传入函数是一个空函数，那么直接返回。
// 正常情况下，进入 doResolve 开始流程。
// 先直接跟进doResolve(定义在core.js的最后)看看发生了什么:
function doResolve(fn, promise) {
    var done = false;
    var res = tryCallTwo(fn, function (value) {
      if (done) return;
      done = true;
      resolve(promise, value);
    }, function (reason) {
      if (done) return;
      done = true;
      reject(promise, reason);
    });
    if (!done && res === IS_ERROR) {
      done = true;
      reject(promise, LAST_ERROR);
    }
  }
// 这里同步的直接调用传入的函数，讲两个函数作为参数传入 (即外部编写的resolve和reject) , 调用完成后检查下是否是没完成的情况下出错了，如果是直接reject.
// 针对传入的resolve函数和reject函数,等待结果后，如果尚未完成，则通过本文件中定义的resolve和reject来继续流程.
// 我们来看看resolve和reject的代码 - 代码比较长，就直接在代码段里说明了
function resolve(self, newValue) {
    // 首先一个Promise的解决结果不能是自己 （自己返回自己然后等待自己，循环）
     if (newValue === self) {
       return reject(
         self,
         new TypeError('A promise cannot be resolved with itself.')
       );
     }
     // 当新的值存在，类型是对象或者函数的时候
     if (
       newValue &&
       (typeof newValue === 'object' || typeof newValue === 'function')
     ) {
      //判断是否有then函数
       var then = getThen(newValue);
       if (then === IS_ERROR) {
         // 没有的话直接报错
         return reject(self, LAST_ERROR);
       }
       if (
         then === self.then &&
         newValue instanceof Promise // 如果结果是一个Promise
       ) {
         self._state = 3;
         self._value = newValue;
         finale(self); // 那么采用这个Promise的结果
         return;
       } else if (typeof then === 'function') {
         doResolve(then.bind(newValue), self); // 如果是函数，则继续调用doResolve
         return;
       }
     }
     self._state = 1; //如果不是以上情况 (返回对象或者函数)， 则标记完成，进入结束流程
     self._value = newValue;
     finale(self); //下面将这个函数
   }

   function reject(self, newValue) {
     //设置reject状态和理由
     self._state = 2;
     self._value = newValue;
     if (Promise._onReject) {
       Promise._onReject(self, newValue); //过程回调通知
     }
     finale(self); //结束
   }
//    我们看到最终的结束流程都是在finale 代码如下：
function finale(self) {
    if (self._deferredState === 1) {
      handle(self, self._deferreds);
      self._deferreds = null;
    }
    if (self._deferredState === 2) {
      for (var i = 0; i < self._deferreds.length; i++) {
        handle(self, self._deferreds[i]);
      }
      self._deferreds = null;
    }
  }
//   突然就冒出来之前未曾触及到的_deferredState和_deferreds的使用，他们是什么用的？
// 在回答这些之前，我们先回想下在Promise的时候中，当创建并返回了promise之后，下面的操作就是then来获取结果了 (当然也包括catch)， 那么对于这个then的实现我们先来看一下：
Promise.prototype.then = function(onFulfilled, onRejected) {
    if (this.constructor !== Promise) {
      return safeThen(this, onFulfilled, onRejected);
    }
    var res = new Promise(noop);
    handle(this, new Handler(onFulfilled, onRejected, res));
    return res;
  };
//   其中的safeThen和then的用法基本一致，都是创建了一个异步的空回调res，然后使用onFulfilled, onRejected和res来创建 Handler。那么核心就在handle这个函数上了：
function handle(self, deferred) {
    while (self._state === 3) {
      self = self._value;
    }
    if (Promise._onHandle) { // for injection - not in main loop
      Promise._onHandle(self);
    }
    if (self._state === 0) {
      if (self._deferredState === 0) {
        self._deferredState = 1;
        self._deferreds = deferred;
        return;
      }
      if (self._deferredState === 1) {
        self._deferredState = 2;
        self._deferreds = [self._deferreds, deferred];
        return;
      }
      self._deferreds.push(deferred);
      return;
    }
    handleResolved(self, deferred);
  }
//   WOW, 这个函数的参数就是deferred啊， 那么说明deferred就是Handler, 结合意思，指代的就是延迟的处理。明白点说，就是完成promise之后所需要做的事情。
//   那么具体的过程是怎么样的呢？
//   首先判断当前状态是不是依赖于另一个promise, 是的话则通过while等待 (疑问 这不把thread无限锁死了嘛？ )
//   然后onHandle只是个提供给外部的进度回调，这里先无视
//   当状态为0的时候，这里就是设置未来的处理过程了，
// 如果未来状态没有设置过（0）， 那么设置成功的回调(deferred) 为单独回调
// 如果未来状态设置过了 (1),  那么设置失败的回调 (deferred) 进入回调数组
// 如果其他状态 (2 +)，那么直接进入回调数组。
// 对状态0情况下的处理这里就返回了。 因为在这个时候，是promise同步执行过来的then, 设置好未来处理的函数过程。
// 当状态非0的时候， 就进入了handleResolved，这应该就是完成后处理结束的地方了。 等等，上面只是从then出发进入handle的，那时候应该promise还没有完成，
// 处理完成的调用一定是在别的地方。 通过搜索handle的调用可以看到还有在finale函数中， 这样就和上面连接上了，我们先回顾下什么时候会调用finale呢？
// 1 状态3 等待其他promise的结果时候 - 这里会进入等待
// 2 状态1 完成的时候
// 3 状态2 reject的时候
// 可以看到只有在promise结束或者依赖其他promise的时候，才会进入finale.
function finale(self) {
    if (self._deferredState === 1) {
      handle(self, self._deferreds);
      self._deferreds = null;
    }
    if (self._deferredState === 2) {
      for (var i = 0; i < self._deferreds.length; i++) {
        handle(self, self._deferreds[i]);
      }
      self._deferreds = null;
    }
  }
//   finale中会将之前放入的deffereds 一一取出 调用handle, 这时state均为非0，直接进入handleResolved， 代码如下:
  function handleResolved(self, deferred) {
    asap(function() {
      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        if (self._state === 1) {
          resolve(deferred.promise, self._value);
        } else {
          reject(deferred.promise, self._value);
        }
        return;
      }
      var ret = tryCallOne(cb, self._value);
      if (ret === IS_ERROR) {
        reject(deferred.promise, LAST_ERROR);
      } else {
        resolve(deferred.promise, ret);
      }
    });
  }

// 这里就比较简单的，通过异步的asap调用，如果没有onFulfilled(onRejected失败情况)，则直接调用resolve(reject),
// 如果有则先调用onFulfilled(onRejected失败情况)，根据结果来调用resolve(reject)。
// 等等。。这里的resolve和reject不是在上面的流程中有出现了么？请注意这里resolve和 rejected的promise,
// 这个promise是在then的时候创建的空promise,也就是意味这什么都不会执行 （直接进入finale 无handle情况)。
// 所以真正影响这里流程的是 对于deferred.onFulfilled 或者 deferred.onRejected的回调执行，执行完回调 这个promise的执行过程就完成了。
// 综上, promise的执行过程是这样的
创建Promise
设置需要执行的函数
设置完成的回调
开始执行函数
根据执行结果选择回调
另外提一句safeThen, safeThen的作用是当调用then的时候环境this已经不是Promise的情况下能够继续安全执行then。
其他的一些辅助代码文件：
index.js 包含所有代码的主文件
done.js - done和then基本相同，只是增加了一个默认then捕捉并抛出错误
es6-extensions.js - 增加了在es6下的一些额外定义支持，关于es6可以参考这个系列.
Promise.resolve 判断类型并立即返回
Promise.all 支持多个promise的集中等待结果﻿
Promise.reject 立即失败的Promise
Promise.race 取最快的结果返回
Promise.catch 只有reject情况的then.
finally.js 支持Promise的finally函数, 无论resolve或者reject后都会被确保调用参数函数。
node-extension.js 一些node风格的函数转变为promise, 非标准函数
rejection-tracking.js 中间所提到的过程回调的管理函数, 激活,设置函数，白名单等。
synchronous.js 一些同步的获取promise状态和信息的函数 ，也可以通过disableSynchronous 关闭。

// 原始方法
setTimeout(function(){
    var a=100;
    console.log(a);
    setTimeout(function () {
        var b=200;
        console.log(b)
        setTimeout(function () {
            var c=300;
            console.log(c)
        }, 1000);
    }, 1000);
},1000);
// promise实现
new Promise(function (resolve, reject) {
    setTimeout(function () {
        var a=100;
        resolve(a);
    }, 1000);
}).then(function (res) {
    console.log(res);
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            var b=200;
            resolve(b);
        }, 1000);
    })
}).then(function (res) {
    console.log(res);
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            var c=300
            resolve(c);
        }, 1000);
    })
}).then(function (res) {
        console.log(res);
    }
    )
    // 封装promise
                /*
            我们要满足状态只能三种状态：PENDING,FULFILLED,REJECTED三种状态，且状态只能由PENDING=>FULFILLED,或者PENDING=>REJECTED
            */
           var PENDING = 0;
           var FULFILLED = 1;
           var REJECTED = 2;
           /*
           value状态为执行成功事件的入参，deferreds保存着状态改变之后的需要处理的函数以及promise子节点，构造函数里面应该包含这三个属性的初始化
            */
           function Promise(callback) {
               this.status = PENDING;
               this.value = null;
               this.defferd = [];
               setTimeout(callback.bind(this, this.resolve.bind(this), this.reject.bind(this)), 0);
           }

           Promise.prototype = {
               constructor: Promise,
               //触发改变promise状态到FULFILLED
               resolve: function (result) {
                   this.status = FULFILLED;
                   this.value = result;
                   this.done();
               },
               //触发改变promise状态到REJECTED
               reject: function (error) {
                   this.status = REJECTED;
                   this.value = error;
               },
               //处理defferd
               handle: function (fn) {
                   if (!fn) {
                       return;
                   }
                   var value = this.value;
                   var t = this.status;
                   var p;
                   if (t == PENDING) {
                        this.defferd.push(fn);
                   } else {
                       if (t == FULFILLED && typeof fn.onfulfiled == 'function') {
                           p = fn.onfulfiled(value);
                       }
                       if (t == REJECTED && typeof fn.onrejected == 'function') {
                           p = fn.onrejected(value);
                       }
                   var promise = fn.promise;
                   if (promise) {
                       if (p && p.constructor == Promise) {
                           p.defferd = promise.defferd;
                       } else {
                           p = this;
                           p.defferd = promise.defferd;
                           this.done();
                       }
                   }
                   }
               },
               //触发promise defferd里面需要执行的函数
               done: function () {
                   var status = this.status;
                   if (status == PENDING) {
                       return;
                   }
                   var defferd = this.defferd;
                   for (var i = 0; i < defferd.length; i++) {
                       this.handle(defferd[i]);
                   }
               },
               /*储存then函数里面的事件
               返回promise对象
               defferd函数当前promise对象里面
               */
               then: function (success, fail) {
                  var o = {
                       onfulfiled: success,
                       onrejected: fail
                   };
                   var status = this.status;
                   o.promise = new this.constructor(function () {

                   });
                   if (status == PENDING) {
                       this.defferd.push(o);
                   } else if (status == FULFILLED || status == REJECTED) {
                       this.handle(o);
                   }
                   return o.promise;
               }
           };

