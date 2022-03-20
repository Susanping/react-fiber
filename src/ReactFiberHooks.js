


/*
 * @Author: sun_ping
 * @Date: 2022-03-19 11:26:26
 * @LastEditors: sun_ping
 * @LastEditTime: 2022-03-19 22:25:21
 * @Description: 
 */
import {scheduleUpdateOnFiber} from './ReactFiberWorkLoop'
let workInProgressHook = null; //当前的新hook
let currentHook = null;//当前的老hook
let currentlyRenderingFiber; //当前正在使用的fiiber
let ReactCurrentDispatcher={current:null}
const HookDispatcherOnUpdate={
    useReducer:updateReducer
}
const HookDispatcherOnMount={
    useReducer:mountReducer
}
export function useReducer(reducer,initialArg){
    return ReactCurrentDispatcher.current.useReducer(reducer,initialArg)
}
export function renderWithHooks(current,workInProgress,Component){
    currentlyRenderingFiber = workInProgress;
    currentlyRenderingFiber.memoizedState =null;
    if(current!==null){//更新
        ReactCurrentDispatcher.current = HookDispatcherOnUpdate;
    }else{
        ReactCurrentDispatcher.current = HookDispatcherOnMount;
    }
   
    let children = Component();
    currentlyRenderingFiber  = null;
    workInProgressHook=null;
    currentHook =null;
    return children;

}
function updateReducer(reducer,initialArg){
    let hook = updateWorkInProgressHook();
    const queue = hook.queue;
    let current = currentHook;
    const pendingQueue = queue.pending;
    if(pendingQueue!==null){
       // 根据老的状态和更新队列里的
       let first = pendingQueue.next;
       let newState = current.memoizedState;
       let update = first;
       do{
           const action  = update.action;
           newState = reducer(newState,action);
           update =update.next;
       }while(update!==null && update!==first)
    //    queue.pending = null; // 为什么要清楚
       hook.memoizedState = newState;
    }
  const dispatch = dispatchAction.bind(null,'1',currentlyRenderingFiber,queue)
  return [hook.memoizedState,dispatch]


}
function mountReducer(reducer,initialArg){
    //构建单向链表
   let hook = mountWorkInProgressHook()
//    console.log('构建单向链表=======》',hook)
   hook.memoizedState = initialArg;
   const queue=(hook.queue={pending:null});//更新队列
   const dispatch = dispatchAction.bind(null,'0',currentlyRenderingFiber,queue)
   debugger
   return [hook.memoizedState,dispatch]

}
function dispatchAction(number,currentlyRenderingFiber,queue,action){
    debugger
    const update = {action,next:null};
    const pending = queue.pending;
    if(pending===null){
        update.next = update;
    }else{
        update.next = pending.next;
        pending.next = update;
    }
    queue.pending = update;
    console.log('queue=======>',queue.pending)//
    /**
     * currentlyRenderingFiber:
     *  alternate: null
        child: {tag: 5, type: 'div'}
        memoizedState:{
              memoizedState: 0
              next: null
              queue:
              pending: {action: {…}, next: {…}}
        }
        tag: 0
        type: ƒ Counter()
     */
    scheduleUpdateOnFiber(currentlyRenderingFiber)//基于这个老的构建新的
}
function updateWorkInProgressHook(){
    let nextCurrentHook;
    if(currentHook==null){
        let current = currentlyRenderingFiber.alternate;//currentlyRenderingFiber == workInprogress
        nextCurrentHook=current.memoizedState
    }else{
        nextCurrentHook = currentHook.next;
    }
    currentHook=nextCurrentHook;

   const newHook = {
       memoizedState:currentHook.memoizedState,
       queue:currentHook.queue,
       next:null
   }
   if(workInProgressHook===null){
     currentlyRenderingFiber.memoizedState = workInProgressHook = newHook;
   }else{
       workInProgressHook.next=newHook;
       workInProgressHook=newHook;
   }
   return workInProgressHook;
}
function mountWorkInProgressHook(){
   let hook ={//创建一个hook 对象
       memoizedState:null,
       queue:null,//自己的更新队列
       next:null
   }
   //说明这是我们的第一个hook
   if(workInProgressHook === null){
     currentlyRenderingFiber.memoizedState = workInProgressHook =hook
   }else{
    workInProgressHook = workInProgressHook.next = hook;
   }
   console.log('workInProgressHook=======>',workInProgressHook)
   return workInProgressHook;

}