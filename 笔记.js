事件流
在了解事件之前先来看一下什么是事件流。
'流’这个名词在JS中随处可见。像DOM事件流、React中的数据流等等。 其实，流就是一种有方向的数据；事件流，是页面接受事件的顺序。
一、DOM事件流的三个阶段
1、事件捕获阶段 当某个事件触发时，文档根节点最先接受到事件，然后根据DOM树结构向具体绑定事件的元素传递。该阶段为父元素截获事件提供了机会。 事件传递路径为： window —> document —> boy —> button
2、目标阶段 具体元素已经捕获事件。之后事件开始想根节点冒泡。
3、事件冒泡阶段 该阶段的开始即是事件的开始，根据DOM树结构由具体触发事件的元素向根节点传递。 事件传递路径： button —> body —> document —> window
4、选择监听事件的阶段 使用addEventListener函数在事件流的的不同阶段监听事件。 DOMEle.addEventListener(‘事件名称’,handleFn,Boolean); 此处第三个参数Boolean即代表监听事件的阶段； 为true时，在在捕获阶段监听事件，执行逻辑处理； 为false时，在冒泡阶段监听事件，执行逻辑处理。
二、react合成事件
1、合成事件原理 如果react事件绑定在了真实DOM节点上，一个节点同事有多个事件时， 页面的响应和内存的占用会受到很大的影响。因此SyntheticEvent作为 中间层出现了。 事件没有在目标对象上绑定，而是在document上监听所支持的所有事件，当事件发生并冒泡至document时，react将事件内容封装并叫由真正的处理函数运行。

2、绑定方式

绑定事件的属性名是采用驼峰形式的；
事件处理函数是一个函数，而不是像原生事件那样的函数名称；
<div onClick={this.handleClick}>点我呀！</div>
React合成事件和原生事件区别

React合成事件一套机制：React并不是将click事件直接绑定在dom上面，而是采用事件冒泡的形式冒泡到document上面，然后React将事件封装给正式的函数处理运行和处理。
React合成事件理解

如果DOM上绑定了过多的事件处理函数，整个页面响应以及内存占用可能都会受到影响。React为了避免这类DOM事件滥用，同时屏蔽底层不同浏览器之间的事件系统差异，实现了一个中间层——SyntheticEvent。
当用户在为onClick添加函数时，React并没有将Click时间绑定在DOM上面。
而是在document处监听所有支持的事件，当事件发生并冒泡至document处时，React将事件内容封装交给中间层SyntheticEvent（负责所有事件合成）
所以当事件触发的时候，对使用统一的分发函数dispatchEvent将指定函数执行。
React真正处理合成事件过程，可以具体可以参考相关的源码解析：React源码解读系列 – 事件机制
以下用代码来展示两者的区别：


classTestextendsComponent{
constructor(){
super(arguments);
this.onReactClick.bind(this);
}
componentDidMount(){
constparentDom=ReactDOM.findDOMNode(this);
constchildrenDom=parentDom.queneSelector(".button");
childrenDom.addEventListen('click',this.onDomClick,false);
}
onDomClick(){//事件委托
console.log('JavascriptDomclick');
}
onReactClick(){//react合成事件
console.log('Reactclick');
}
render(){
<div>
<buttonclassName="button"onClick={this.onReactClick()}>点击
    </button>
</div>
}
}
结果：

Domclick
Reactclick
可以看待原生绑定快于合成事件绑定。



我开始转向使用PureCompoent是因为它是一个更具性能的Component的版本。虽然事实证明这是正确的，但是这种性能的提高还伴随着一些附加的条件。让我们深挖一下PureComponent，并理解为什么我们应该使用它。
Component和PureComponent有一个不同点

除了为你提供了一个具有浅比较的shouldComponentUpdate方法，PureComponent和Component基本上完全相同。当props或者state改变时，PureComponent将对props和state进行浅比较。另一方面，Component不会比较当前和下个状态的props和state。因此，每当shouldComponentUpdate被调用时，组件默认的会重新渲染。
浅比较101

当把之前和下一个的props和state作比较，浅比较将检查原始值是否有相同的值（例如：1 == 1或者ture==true）,数组和对象引用是否相同。
从不改变

您可能已经听说过，不要在props和state中改变对象和数组，如果你在你的父组件中改变对象，你的“pure”子组件不将更新。虽然值已经被改变，但是子组件比较的是之前props的引用是否相同，所以不会检测到不同。
因此，你可以通过使用es6的assign方法或者数组的扩展运算符或者使用第三方库，强制返回一个新的对象。
存在性能问题？

比较原始值值和对象引用是低耗时操作。如果你有一列子对象并且其中一个子对象更新，对它们的props和state进行检查要比重新渲染每一个子节点要快的多。
其它解决办法
不要在render的函数中绑定值

假设你有一个项目列表，每个项目都传递一个唯一的参数到父方法。为了绑定参数，你可能会这么做：


1
<CommentItemlikeComment={()=>this.likeComment(user.id)}/>
这个问题会导致每次父组件render方法被调用时，一个新的函数被创建，已将其传入likeComment。这会有一个改变每个子组件props的副作用，它将会造成他们全部重新渲染，即使数据本身没有发生变化。
为了解决这个问题，只需要将父组件的原型方法的引用传递给子组件。子组件的likeComment属性将总是有相同的引用，这样就不会造成不必要的重新渲染。


1
<CommentItemlikeComment={this.likeComment}userID={user.id}/>
然后再子组件中创建一个引用了传入属性的类方法：

classCommentItemextendsPureComponent{
...
handleLike(){
this.props.likeComment(this.props.userID)
}
...
}
不要在render方法里派生数据

考虑一下你的配置组件将从一系列文章中展示用户最喜欢的十篇文章。

render(){
const{posts}=this.props
consttopTen=posts.sort((a,b)=>b.likes-a.likes).slice(0,9)
return//...
}
每次组件重新渲染时topTen都将有一个新的引用，即使posts没有改变并且派生数据也是相同的。这将造成列表不必要的重新渲染。
你可以通过缓存你的派生数据来解决这个问题。例如，设置派生数据在你的组件state中，仅当posts更新时它才更新。


componentWillMount(){
this.setTopTenPosts(this.props.posts)
}
componentWillReceiveProps(nextProps){
if(this.props.posts!==nextProps.posts){
this.setTopTenPosts(nextProps)
}
}
setTopTenPosts(posts){
this.setState({
topTen:posts.sort((a,b)=>b.likes-a.likes).slice(0,9)
})
}
如果你正在使用Redux，可以考虑使用reselect来创建"selectors"来组合和缓存派生数据。
结束语
只要你遵循下列两个简单的规则就可以安全的使用PureComponent来代替Component:



1. 容易出错的 var 提升
有时候我们会在zuo内作用域内看到一个奇怪的变量var varname和函数函数function funName() {...} 声明：

//varhoisting
num;//=>undefined
varnum;
num=10;
num;//=>10
//functionhoisting
getPi;//=>functiongetPi(){...}
getPi();//=>3.14
functiongetPi(){
return3.14;
}
复制代码
变量num在声明var num之前被访问，因此它被赋值为undefined。fucntion getPi(){…}在文件末尾定义。但是，可以在声明getPi()之前调用该函数，因为它被提升到作用域的顶部。
事实证明，先使用然后声明变量或函数的可能性会造成混淆。假设您滚动一个大文件，突然看到一个未声明的变量，它到底是如何出现在这里的，以及它在哪里定义的？
当然，一个熟练的JavaScript开发人员不会这样编写代码。但是在成千上万的JavaScript中，GitHub repos是很有可能处理这样的代码的。
即使查看上面给出的代码示例，也很难理解代码中的声明流。
当然，首先要声明再使用。let 鼓励咱们使用这种方法处理变量。
2. 理解背后原理：变量生命周期
当引擎处理变量时，它们的生命周期由以下阶段组成：
**声明阶段(Declaration phase)**是在作用域中注册一个变量。
**初始化阶段(Initialization phase)**是分配内存并为作用域中的变量创建绑定。 在此步骤中，变量将使用undefined自动初始化。
**赋值阶段(Assignment phase)**是为初始化的变量赋值。
变量在通过声明阶段时尚未初始化状态，但未达到初始化状态。



请注意，就变量生命周期而言，声明阶段与变量声明是不同的概念。 简而言之，JS引擎在3个阶段处理变量声明：声明阶段，初始化阶段和赋值阶段。
3.var 变量的生命周期
熟悉生命周期阶段之后，让我们使用它们来描述JS引擎如何处理var变量。



假设JS遇到一个函数作用域，其中包含var变量语句。变量在执行任何语句之前通过声明阶段，并立即通过作用域开始处的初始化阶段(步骤1)。函数作用域中var变量语句的位置不影响声明和初始化阶段。
在声明和初始化之后，但在赋值阶段之前，变量具有undefined 的值，并且已经可以使用。
在赋值阶段variable = 'value' 时，变量接收它的初值(步骤2)。
严格意义的提升是指在函数作用域的开始处声明并初始化一个变量。声明阶段和初始化阶段之间没有差别。
让我们来研究一个例子。下面的代码创建了一个包含var语句的函数作用域


functionmultiplyByTen(number){
console.log(ten);//=>undefined
varten;
ten=10;
console.log(ten);//=>10
returnnumber*ten;
}
multiplyByTen(4);//=>40
复制代码
开始执行multipleByTen(4)并进入函数作用域时，变量ten在第一个语句之前通过声明和初始化步骤。因此，当调用console.log(ten)时，打印undefined。语句ten = 10指定一个初值。赋值之后，console.log(ten) 将正确地打印10。
4. 函数声明生命周期
在函数声明语句function funName() {...}的情况下，它比变量声明生命周期更简单。



声明、初始化和赋值阶段同时发生在封闭函数作用域的开头(只有一步)。可以在作用域的任何位置调用funName()，而不依赖于声明语句的位置(甚至可以在末尾调用)。
下面的代码示例演示了函数提升：


functionsumArray(array){
returnarray.reduce(sum);
functionsum(a,b){
returna+b;
}
}
sumArray([5,10,8]);//=>23
复制代码
当执行sumArray([5,10,8])时，它进入sumArray函数作用域。在这个作用域内，在任何语句执行之前，sum都会通过所有三个阶段:声明、初始化和赋值。这样，array.reduce(sum)甚至可以在它的声明语句sum(a, b){…}之前使用sum。
5. let 变量的生命周期
let 变量的处理方式与var不同，主要区别在于声明和初始化阶段是分开的。



现在来看看一个场景，当解释器进入一个包含let变量语句的块作用域时。变量立即通过声明阶段，在作用域中注册其名称(步骤1)。
然后解释器继续逐行解析块语句。
如果在此阶段尝试访问变量，JS 将抛出 ReferenceError: variable is not defined。这是因为变量状态未初始化，变量位于暂时死区 temporal dead zone。
当解释器执行到语句let variable时，传递初始化阶段(步骤2)。变量退出暂时死区。
接着，当赋值语句variable = 'value'出现时，将传递赋值阶段(步骤3)。
如果JS 遇到let variable = 'value'，那么初始化和赋值将在一条语句中发生。
让我们看一个例子，在块作用域中用 let 声明变量 number


letcondition=true;
if(condition){
//console.log(number);//=>ThrowsReferenceError
letnumber;
console.log(number);//=>undefined
number=5;
console.log(number);//=>5
}
复制代码
当 JS 进入if (condition) {...} 块作用域，number立即通过声明阶段。
由于number已经处于单一化状态，并且处于的暂时死区，因此访问该变量将引发ReferenceError: number is not defined。接着，语句let number进行初始化。现在可以访问变量，但是它的值是undefined。
const和class 类型与let具有相同的生命周期，只是分配只能发生一次。
5.1 提升在let生命周期中无效的原因

如上所述，提升是变量在作用域顶部的耦合声明和初始化阶段。然而，let生命周期分离声明和初始化阶段。解耦消除了let的提升期限。
这两个阶段之间的间隙产生了暂时死区，在这里变量不能被访问。
总结
使用var声明变量很容易出错。在此基础上，ES6 引入了let。它使用一种改进的算法来声明变量，并附加了块作用域。
由于声明和初始化阶段是解耦的，提升对于let变量(包括const和class)无效。在初始化之前，变量处于暂时死区，不能访问。
为了保持变量声明的流畅性，建议使用以下技巧
声明、初始化然后使用变量，这个流程是正确的，易于遵循。
尽量隐藏变量。公开的变量越少，代码就越模块化。


这个问题说明：如果 let x 的初始化过程失败了，那么
x 变量就将永远处于 created 状态。
你无法再次对 x 进行初始化（初始化只有一次机会，而那次机会你失败了）。
由于 x 无法被初始化，所以 x 永远处在暂时死区
有人会觉得 JS 坑，怎么能出现这种情况；其实问题不大，因为此时代码已经报错了，后面的代码想执行也没机会。

================================= =================================
为什么Redux需要reducers是纯函数
================================= =================================
你可能知道Redux依赖函数式编程中的纯函数。这究竟是什么意思呢？
下面的这张图片是来自Redux示例中的一个Todo应用。它目前有四个Todo任务。它展示了所有已完成和未完成的任务，我们可以看到第四个任务为已完成状态。图片的右侧展示了存储在Redux当中的当前state。这是一个包含了所有详细信息的Javascript对象。
图片的右侧展示了存储在Redux当中的当前state。这是一个包含了所有详细信息的Javascript对象。
这是Redux精妙之处。

图注：左边: Todo app <- -> 右边: Redux stated
现在让我们切换第四个Todo任务的状态使其变为未完成。下图右边是应用中新的Redux的state：

图注：应用发生改变时，Redux 更新state
现在如果你去Reducer当中查看“TOGGLE_TODO”部分，“TOGGLE_TODO”是切换应用中一个Todo项的完成和未完成状态，它的代码如下 (点击查看源码):

当你切换一个Todo项的状态，将发生如下过程：reducer函数接收一个表示旧的state的对象（也就是函数的输入），然后通过复制旧对象的所有属性（像id和text）和用新的属性覆盖旧的属性（completed属性）来创建一个新的对象。

纯函数

从本质上讲，纯函数的定义如下：不修改函数的输入值，依赖于外部状态（比如数据库，DOM和全局变量），同时对于任何相同的输入有着相同的输出结果。
举个例子，下面的add函数不修改变量a或b，同时不依赖外部状态，对于相同的输入始终返回相同的结果。


const add=(a,b)=>a+b//purefunction
现在我们回过头去看reducer函数，它符合上述纯函数的所有特征，因此我们说reducer是纯函数。
但是为什么reducer必须为纯函数？

让我们来看看如果reducer不是纯函数会发生什么。我们注释掉之前reducer中返回新对象的代码部分，然后我们直接修改state的completed属性。


1
12345678910111213141516


1
case'TOGGLE_TODO':if(state.id!==action.id){returnstate
    ;}//return{//...state,//completed:!state
    .completed//}
    //mutatethestate’scompletedpropdirectlystate.completed=!state
    .completed;//changeoriginalobjectreturnstate;default:...
做上述改变后，我们触发TOGGLE_TODO，会发现没有任何变化发生。
下图是Redux的部分源码。

我们阅读源码可以看到，Redux接收一个给定的state（对象），然后通过循环将state的每一部分传递给每个对应的reducer。如果有发生任何改变，reducer将返回一个新的对象。如果不发生任何变化，reducer将返回旧的state。
Redux只通过比较新旧两个对象的存储位置来比较新旧两个对象是否相同（译者注：也就是Javascript对象浅比较）。如果你在reducer内部直接修改旧的state对象的属性值，那么新的state和旧的state将都指向同一个对象。因此Redux认为没有任何改变，返回的state将为旧的state。
但是，我们仍然有一些关键问题没有解答：
为什么Redux这样设计？
为什么Redux不在其他地方复制一份旧的state，然后将其和reducers返回的对象进行比较？
为什么Redux要将这个负担交给开发者？
答案只有一个：因为比较两个Javascript对象所有的属性是否相同的的唯一方法是对它们进行深比较。
但是深比较在真实的应用当中代价昂贵，因为通常js的对象都很大，同时需要比较的次数很多。
因此一个有效的解决方法是作出一个规定：无论何时发生变化时，开发者都要创建一个新的对象，然后将新对象传递出去。同时，当没有任何变化发生时，开发者发送回旧的对象。也就是说，新的对象代表新的state。
必须注意到你只能使用slice（译者注：此处slice类似数组的slice方法，具体可以使用本文例子中解构赋值等方法进行slice）或者类似的机制去复制旧的值到新的对象里。
现在使用了新的策略之后，你能够比较两个对象通过使用!==比较两个对象的存储位置而不是比较两个对象的所有属性。同时当两个对象不同的时候，你就能知道新的对象已经改变了旧的state（也就是说，JavaScript对象当中的某些属性的值发生了变化）。这正是Redux所采取的策略。
这就是为什么Redux需要reducers是纯函数的原因！


