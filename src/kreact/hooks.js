import {scheduleUpdateOnFiber} from "./ReactFiberWorkLoop";
import {HookPassive, areHookInputsEqual, HookLayout} from "./utils";

let currentlyRenderingFiber = null;
let workInProgressHook = null;
let currentHook = null;
// old 1 2 3 4
// new 1 2

export function renderHooks(wip) {
  currentlyRenderingFiber = wip;
  currentlyRenderingFiber.memorizedState = null; //hook0设置为null
  workInProgressHook = null;
  currentHook = null;
  currentlyRenderingFiber.updateQueueOfEffect = [];
  currentlyRenderingFiber.updateQueueOfLayout = [];
}

//获取当前hook , 也是构建fibe上hook链表的过程
function updateWorkProgressHook() {
  let hook = null;
  const current = currentlyRenderingFiber.alternate;
  // 初次渲染还是更新
  if (current) {
    // 更新
    // 更新就是在老的基础上更新
    currentlyRenderingFiber.memorizedState = current.memorizedState;
    if (workInProgressHook) {
      // not head
      hook = workInProgressHook = workInProgressHook.next;
      currentHook = currentHook.next;
    } else {
      // head hook
      hook = workInProgressHook = current.memorizedState;
      currentHook = current.memorizedState;
    }
  } else {
    // 初次渲染
    hook = {memorizedState: null, next: null};
    currentHook = null;
    if (workInProgressHook) {
      // not head
      workInProgressHook = workInProgressHook.next = hook;
    } else {
      // head hook
      workInProgressHook = currentlyRenderingFiber.memorizedState = hook;
    }
    console.log('workInProgressHook=====>',workInProgressHook)
  }

  return hook;
}
// hook {memorizedState状态值，next指向下一个hook }
export function useReducer(reducer, initialState) {
  // 获取到当前useReducer对应的hook
  const hook = updateWorkProgressHook();

  if (!currentlyRenderingFiber.alternate) {
    // 初次渲染

    hook.memorizedState = initialState;
  }

  const dispatch = (action) => {
    hook.memorizedState = reducer(hook.memorizedState, action);
    //从函数开始更新，也就是得拿到函数组件的fiber
    scheduleUpdateOnFiber(currentlyRenderingFiber);
  };
  // todo
  return [hook.memorizedState, dispatch];
}

export function updateEffectImpl(hookFlags, create, deps) {
  // 获取到当前useEffect对应的hook
  const hook = updateWorkProgressHook();

  // 检查依赖项是否发生变化，只在更新的时候检查
  if (currentHook) {
    // 检查deps
    const prevEffect = currentHook.memorizedState;
    if (deps) {
      const prevDeps = prevEffect.deps;
      if (areHookInputsEqual(deps, prevDeps)) {
        return;
      }
    }
  }

  const effect = {create, deps, hookFlags};
  hook.memorizedState = effect;

  if (hookFlags & HookPassive) {
    currentlyRenderingFiber.updateQueueOfEffect.push(effect);
  } else {
    currentlyRenderingFiber.updateQueueOfLayout.push(effect);
  }
}

export function useEffect(create, deps) {
  return updateEffectImpl(HookPassive, create, deps);
}

export function useLayoutEffect(create, deps) {
  return updateEffectImpl(HookLayout, create, deps);
}
