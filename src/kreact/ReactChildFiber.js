import {isArray, isStringOrNumber, Update, Placement} from "./utils";
import createFiber from "./createFiber";

// commit阶段提交的是新fiber
function deleteChild(returnFiber, childToDelete) {
  if (returnFiber.deletions) {
    returnFiber.deletions.push(childToDelete);
  } else {
    returnFiber.deletions = [childToDelete];
  }
}

function placeChild(
  newFiber,
  lastPlacedIndex,
  newIndex,
  shouldTrackSideEffects // 初次渲染（false）还是更新（true）
) {
  newFiber.index = newIndex;
  if (!shouldTrackSideEffects) {
    return lastPlacedIndex;
  }
  const current = newFiber.alternate;

  if (current) {
    const oldIndex = current.index;
    if (oldIndex < lastPlacedIndex) {
      // move
      newFiber.flags = Placement;
      return lastPlacedIndex;
    } else {
      return oldIndex;
    }
  } else {
    newFiber.flags = Placement;
    return lastPlacedIndex;
  }
}

function mapRemainingChildren(currentFirstChild) {
  const existingChildren = new Map();
  let existingChild = currentFirstChild;
  while (existingChild) {
    existingChildren.set(
      existingChild.key || existingChild.index,
      existingChild
    );
    existingChild = existingChild.sibling;
  }
  return existingChildren;
}

// 删除节点链表,头结点是currentFirstChild
function deleteRemainingChildren(returnFiber, currentFirstChild) {
  let childToDelete = currentFirstChild;
  while (childToDelete) {
    deleteChild(returnFiber, childToDelete);
    childToDelete = childToDelete.sibling;
  }
}

export function reconcileChildren(returnFiber, children) {
  if (isStringOrNumber(children)) {
    return;
  }

  const newChildren = isArray(children) ? children : [children];

  //判断是不是更新 值为true则是更新 否则是初次渲染
  const shouldTrackSideEffects = !!returnFiber.alternate;
  let previousNewFiber = null;
  let oldFiber = returnFiber.alternate && returnFiber.alternate.child;
  let nextOldFiber = null;

  // 记录位置的下标
  let newIndex = 0;
  // 记录上次插入位置
  let lastPlacedIndex = 0;

  // diff
  // old 0 1 5 4 6
  // new 0 1 3 4
  // * 1、从头遍历，直到找到不能复用的节点 这个循环就停止
  for (; oldFiber && newIndex < newChildren.length; newIndex++) {
    const newChild = newChildren[newIndex];
    if (newChild === null) {
      continue;
    }

    if (oldFiber.index > newIndex) {
      nextOldFiber = oldFiber;
      oldFiber = null;
    } else {
      nextOldFiber = oldFiber.sibling;
    }

    const same = sameNode(newChild, oldFiber);
    if (!same) {
      if (oldFiber === null) {
        oldFiber = nextOldFiber;
      }
      break;
    }

    const newFiber = createFiber(newChild, returnFiber);
    Object.assign(newFiber, {
      alternate: oldFiber,
      stateNode: oldFiber.stateNode,
      flags: Update,
    });

    lastPlacedIndex = placeChild(
      newFiber,
      lastPlacedIndex,
      newIndex,
      shouldTrackSideEffects
    );

    if (previousNewFiber === null) {
      returnFiber.child = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }

    previousNewFiber = newFiber;
    oldFiber = nextOldFiber;
  }
  // 34

  if (newIndex === newChildren.length) {
    deleteRemainingChildren(returnFiber, oldFiber);
    return;
  }
  // 1234
  // 345
  if (!oldFiber) {
    for (; newIndex < newChildren.length; newIndex++) {
      const newChild = newChildren[newIndex];
      if (newChild === null) {
        continue;
      }
      const newFiber = createFiber(newChild, returnFiber);

      lastPlacedIndex = placeChild(
        newFiber,
        lastPlacedIndex,
        newIndex,
        shouldTrackSideEffects
      );

      if (previousNewFiber === null) {
        returnFiber.child = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }

      previousNewFiber = newFiber;
    }
    return;
  }

  // oldfiber还有 新节点也还没遍历完
  // old 12 34
  // new 3 4
  // map 12

  const existingChildren = mapRemainingChildren(oldFiber);
  for (; newIndex < newChildren.length; newIndex++) {
    const newChild = newChildren[newIndex];
    if (newChild === null) {
      continue;
    }
    const newFiber = createFiber(newChild, returnFiber);
    lastPlacedIndex = placeChild(
      newFiber,
      lastPlacedIndex,
      newIndex,
      shouldTrackSideEffects
    );

    let matchedFiber = existingChildren.get(newFiber.key || newFiber.index);
    if (matchedFiber) {
      existingChildren.delete(newFiber.key || newFiber.index);
      Object.assign(newFiber, {
        alternate: matchedFiber,
        stateNode: matchedFiber.stateNode,
        flags: Update,
      });
    }

    if (previousNewFiber === null) {
      returnFiber.child = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }

    previousNewFiber = newFiber;
  }

  if (shouldTrackSideEffects) {
    existingChildren.forEach((child) => deleteChild(returnFiber, child));
  }
}
// export function reconcileChildren(returnFiber, children) {
//   if (isStringOrNumber(children)) {
//     return;
//   }

//   const newChildren = isArray(children) ? children : [children];

//   let previousNewFiber = null;
//   let oldFiber = returnFiber.alternate && returnFiber.alternate.child;
//   // diff
//   // old 0 1 2 3 4
//   // new 0 1 3 4
//   for (let i = 0; i < newChildren.length; i++) {
//     const newChild = newChildren[i];
//     if (newChild === null) {
//       continue;
//     }
//     const newFiber = createFiber(newChild, returnFiber);

//     const same = sameNode(newFiber, oldFiber);
//     if (same) {
//       // 节点可以复用
//       Object.assign(newFiber, {
//         alternate: oldFiber,
//         stateNode: oldFiber.stateNode,
//         flags: Update,
//       });
//     }

//     if (!same && oldFiber) {
//       deleteChild(returnFiber, oldFiber);
//     }

//     if (oldFiber) {
//       oldFiber = oldFiber.sibling;
//     }
//     if (previousNewFiber === null) {
//       returnFiber.child = newFiber;
//     } else {
//       previousNewFiber.sibling = newFiber;
//     }

//     previousNewFiber = newFiber;
//   }
// }

function sameNode(a, b) {
  return !!(a && b && a.key === b.key && a.type && b.type);
}
