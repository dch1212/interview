生命周期
初始化阶段：
getDefaultProps:获取实例的默认属性
getInitialState:获取每个实例的初始化状态
componentWillMount：组件即将被装载、渲染到页面上
render:组件在这里生成虚拟的 DOM 节点
componentDidMount:组件真正在被装载之后
运行中状态：
componentWillReceiveProps:组件将要接收到属性的时候调用
shouldComponentUpdate:组件接受到新属性或者新状态的时候（可以返回 false，接收数据后不更新，阻止 render 调用，后面的函数不会被继续执行了）
componentWillUpdate:组件即将更新不能修改属性和状态
render:组件重新描绘
componentDidUpdate:组件已经更新
销毁阶段：
componentWillUnmount:组件即将销毁

setState第二个参数的作用
面试只有58金融问这个问题了。
因为setState是一个异步的过程，所以说执行完setState之后不能立刻更改state里面的值。如果需要对state数据更改监听，setState提供第二个参数，就是用来监听state里面数据的更改，当数据更改完成，调用回调函数。

react中setState以后发生了什么
今日头条面试官问了我这个问题，我按照这个答案回答，然后他表示我理解的不够深，绝望.jpg。有没有大佬可以回答一下这个问题啊！！！

在调用setState以后，
1、react会将传入的参数对象跟当前的state合并，触发调和过程。
2、调和以后，react会高效的根据新的状态构建react元素树。
3、生成react元素树以后，通过diff算法可以得到新树和老树的节点差异。
4、根据这些差异，可以精确的实现按需更新
react中组件传值
父传子（组件嵌套浅）：父组件定义一个属性，子组件通过this.props接收。
子传父：父组件定义一个属性，并将一个回调函数赋值给定义的属性，然后子组件进行调用传过来的函数，并将参数传进去，在父组件的回调函数中即可获得子组件传过来的值。

在 React 当中 Element 和 Component 有何区别？
简单地说，一个 React element 描述了你想在屏幕上看到什么。换个说法就是，一个 React element 是一些 UI 的对象表示。
一个 React Component 是一个函数或一个类，它可以接受输入并返回一个 React element t（通常是通过 JSX ，它被转化成一个 createElement 调用）。
redux
redux 是一个应用数据流框架，主要是解决了组件间状态共享的问题，原理是集中式管理，主要有三个核心方法，action，store，reducer，工作流程是 view 调用 store 的 dispatch 接收 action 传入 store，reducer 进行 state 操作，view 通过 store 提供的 getState 获取最新的数据，flux 也是用来进行数据操作的，有四个组成部分 action，dispatch，view，store，工作流程是 view 发出一个 action，派发器接收 action，让 store 进行数据更新，更新完成以后 store 发出 change，view 接受 change 更新视图。Redux 和 Flux 很像。主要区别在于 Flux 有多个可以改变应用状态的 store，在 Flux 中 dispatcher 被用来传递数据到注册的回调事件，但是在 redux 中只能定义一个可更新状态的 store，redux 把 store 和 Dispatcher 合并,结构更加简单清晰
新增 state,对状态的管理更加明确，通过 redux，流程更加规范了，减少手动编码量，提高了编码效率，同时缺点时当数据更新时有时候组件不需要，但是也要重新绘制，有些影响效率。一般情况下，我们在构建多交互，多数据流的复杂项目应用时才会使用它们。
redux缺点

一个组件所需要的数据，必须由父组件传过来，而不能像 flux 中直接从 store 取。
当一个组件相关数据更新时，即使父组件不需要用到这个组件，父组件还是会重新 render，可能会有效率影响，或者需要写复杂的 shouldComponentUpdate 进行判断。

thunk中间件解决了什么问题？

引入thunk插件后，我们可以在actionCreators内部编写逻辑，处理请求结果。而不只是单纯的返回一个action对象。
thunk是redux作者给出的中间件，实现极为简单，10多行代码：
function createThunkMiddleware(extraArgument) {
  return ({ dispatch, getState }) => next => action => {
    if (typeof action === 'function') {
      return action(dispatch, getState, extraArgument);
    }

    return next(action);
  };
}
const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

export default thunk;
这几行代码做的事情也很简单，判别action的类型，如果action是函数，就调用这个函数，调用的步骤为：

action(dispatch, getState, extraArgument);
1
发现实参为dispatch和getState，因此我们在定义action为thunk函数是，一般形参为dispatch和getState。