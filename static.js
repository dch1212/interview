类相当于实例的原型， 所有在类中定义的方法， 都会被实例继承。 如果在一个方法前， 加上static关键字， 就表示该方法不会被实例继承， 而是直接通过类来调用， 这就称为“ 静态方法”。

classFoo{
    staticclassMethod(){
        return'hello';
    }
}
Foo.classMethod()//'hello'
varfoo=newFoo();
foo.classMethod()
    //TypeError:foo.classMethodisnotafunction
上面代码中， Foo类的classMethod方法前有static关键字， 表明该方法是一个静态方法， 可以直接在Foo类上调用（ Foo.classMethod()）， 而不是在Foo类的实例上调用。 如果在实例上调用静态方法， 会抛出一个错误， 表示不存在该方法。
父类的静态方法， 可以被子类继承。​

classFoo{
staticclassMethod(){
return'hello';
}
}
classBarextendsFoo{}
Bar.classMethod();//'hello'

上面代码中， 父类Foo有一个静态方法， 子类Bar可以调用这个方法。
静态方法也是可以从super对象上调用的。

classFoo{
    staticclassMethod(){
        return'hello';
    }
}
classBarextendsFoo{
    staticclassMethod(){
        returnsuper.classMethod()+',too';
    }
}
Bar.classMethod();
静态属性
静态属性指的是 Class 本身的属性， 即Class.propname， 而不是定义在实例对象（ this） 上的属性。

classFoo{}
Foo.prop=1;
Foo.prop//1
上面的写法为Foo类定义了一个静态属性prop。
目前， 只有这种写法可行， 因为 ES6 明确规定， Class 内部只有静态方法， 没有静态属性
﻿​

//以下两种写法都无效
classFoo{
//写法一
prop:2
//写法二
staticprop:2
}
Foo.prop//undefined


ES7 有一个静态属性的提案， 目前 Babel 转码器支持。
这个提案对实例属性和静态属性， 都规定了新的写法。
（ 1） 类的实例属性
类的实例属性可以用等式， 写入类的定义之中

classMyClass{
    myProp=42;
    constructor(){
        console.log(this.myProp);//42
    }
}
上面代码中， myProp就是MyClass的实例属性。 在MyClass的实例上， 可以读取这个属性。
以前， 我们定义实例属性， 只能写在类的constructor方法里面。

classReactCounterextendsReact.Component{
    constructor(props){
        super(props);
        this.state={
            count:0
        };
    }
}
上面代码中， 构造方法constructor里面， 定义了this.state属性。
有了新的写法以后， 可以不在constructor方法里面定义。

classReactCounterextendsReact.Component{
    state={
        count:0
    };
}
这种写法比以前更清晰。
为了可读性的目的， 对于那些在constructor里面已经定义的实例属性， 新写法允许直接列出。


classReactCounterextendsReact.Component{
    constructor(props){
        super(props);
        this.state={
            count:0
        };
    }
    state;
}
（2） 类的静态属性
类的静态属性只要在上面的实例属性写法前面， 加上static关键字就可以了。

classMyClass{
staticmyStaticProp=42;
constructor(){
console.log(MyClass.myProp);//42
}
}
同样的， 这个新写法大大方便了静态属性的表达。

//老写法
classFoo{}
Foo.prop=1;
//新写法
classFoo{
    staticprop=1;
}
上面代码中， 老写法的静态属性定义在类的外部。 整个类生成以后， 再生成静态属性。 这样让人很容易忽略这个静态属性， 也不符合相关代码应该放在一起的代码组织原则。 另外， 新写法是显式声明（ declarative）， 而不是赋值处理， 语义更好。