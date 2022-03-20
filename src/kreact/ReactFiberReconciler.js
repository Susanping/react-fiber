import {isArray, updateNode} from "./utils";
import {renderHooks} from "./hooks";
import {reconcileChildren} from "./ReactChildFiber";

export function updateHostComponent(wip) {
  // 初次渲染 创建dom节点
  // 更新 不创建dom节点
  if (!wip.stateNode) {
    wip.stateNode = document.createElement(wip.type);
    updateNode(wip.stateNode, {}, wip.props);
  }

  // 协调子节点
  reconcileChildren(wip, wip.props.children);
}

export function updateFunctionComponent(wip) {
  renderHooks(wip);

  const {type, props} = wip;
  const children = type(props);
  reconcileChildren(wip, children);
}

export function updateFragmentComponent(wip) {
  const {props} = wip;
  reconcileChildren(wip, props.children);
}
// 1. 更新自己
// 2. 协调子节点
