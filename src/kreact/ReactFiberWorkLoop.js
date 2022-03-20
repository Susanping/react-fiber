import {
  updateFunctionComponent,
  updateHostComponent,
  updateFragmentComponent,
} from "./ReactFiberReconciler";
import {scheduleCallback, shouldYield} from "./scheduler";
import {isFn, isStr, Placement, Update, updateNode} from "./utils";

// work in progress 正在工作当中的
let wipRoot = null;
// 下一个要更新的任务
let nextUnitOfWork = null;
// 更新vnode
export function scheduleUpdateOnFiber(fiber) {
  fiber.alternate = {...fiber};
  wipRoot = fiber;
  wipRoot.sibling = null;
  nextUnitOfWork = wipRoot;
  scheduleCallback(workLoop);
}

function performUnitOfWork(wip) {
  // 1. 更新自己
  // 组件类型 原生标签 函数组件 类组件 等
  const {type} = wip;
  if (isStr(type)) {
    // 原生标签节点
    updateHostComponent(wip);
  } else if (isFn(type)) {
    updateFunctionComponent(wip);
  } else {
    updateFragmentComponent(wip);
  }

  // todo
  // 2. 返回下一个任务
  // 深度优先
  // 王朝的故事
  if (wip.child) {
    return wip.child;
  }

  while (wip) {
    if (wip.sibling) {
      return wip.sibling;
    }
    wip = wip.return;
  }
  return null;
}

function workLoop() {
  while (nextUnitOfWork && !shouldYield()) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }

  if (!nextUnitOfWork && wipRoot) {
    // commit
    commitRoot();
  }
}

// requestIdleCallback(workLoop);

// commit vnode 也就是同步vnode到node
function commitRoot() {
  isFn(wipRoot.type) ? commitWorker(wipRoot) : commitWorker(wipRoot.child);
}

function invokeHooks(wip) {
  const {updateQueueOfEffect, updateQueueOfLayout} = wip;

  for (let i = 0; i < updateQueueOfLayout.length; i++) {
    const effect = updateQueueOfLayout[i];
    effect.create();
  }

  for (let i = 0; i < updateQueueOfEffect.length; i++) {
    const effect = updateQueueOfEffect[i];
    scheduleCallback(() => {
      effect.create();
    });
  }
}
function commitWorker(wip) {
  if (!wip) {
    return;
  }

  if (isFn(wip.type)) {
    //函数组件
    invokeHooks(wip);
  }
  // 1. commit自己
  // todo
  // node->container
  const {flags, stateNode} = wip;
  // parentNode //父dom节点
  // 12034
  let parentNode = getParentNode(wip); //wip.return.stateNode;
  // if (flags & Placement && stateNode) {
  //   parentNode.appendChild(stateNode);
  // }

  if (flags & Placement && stateNode) {
    let hasSiblingNode = foundSiblingNode(wip, parentNode);
    if (hasSiblingNode) {
      parentNode.insertBefore(stateNode, hasSiblingNode);
    } else {
      parentNode.appendChild(wip.stateNode);
    }
  }

  if (flags & Update && stateNode) {
    // 更新属性
    updateNode(stateNode, wip.alternate.props, wip.props);
  }

  if (wip.deletions) {
    commitDeletion(wip.deletions, stateNode || parentNode);
  }

  // 2. commit孩子
  commitWorker(wip.child);
  // 2. commit兄弟
  commitWorker(wip.sibling);
}

function foundSiblingNode(fiber, parentNode) {
  let siblingHasNode = fiber.sibling;
  let node = null;
  while (siblingHasNode) {
    node = siblingHasNode.stateNode;
    if (node && parentNode.contains(node)) {
      return node;
    }
    siblingHasNode = siblingHasNode.sibling;
  }

  return null;
}

function commitDeletion(deletions, parentNode) {
  for (let i = 0; i < deletions.length; i++) {
    const deletion = deletions[i];
    parentNode.removeChild(getStateNode(deletion));
  }
}

function getStateNode(fiber) {
  let tem = fiber;
  while (!tem.stateNode) {
    tem = tem.child;
  }
  return tem.stateNode;
}

function getParentNode(wip) {
  let parent = wip.return;

  while (parent) {
    if (parent.stateNode) {
      return parent.stateNode;
    }
    parent = parent.return;
  }
}
