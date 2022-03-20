/*
 * @Author: sun_ping
 * @Date: 2022-03-19 11:15:04
 * @LastEditors: sun_ping
 * @LastEditTime: 2022-03-19 19:50:37
 * @Description: 
 */
import {FunctionComponent, HostComponent, IndeterminateComponent} from './ReactWorkTags'
import { renderWithHooks } from './ReactFiberHooks';

/**
 * 
 * @param {*} current 
 * @param {*} workInProgress 
 */
export function beginWork(current,workInProgress){
    if(current){//说明是更新
        switch(workInProgress.tag){
            case FunctionComponent:
                 return updateFunctionComponent(
                    current,
                    workInProgress,
                    workInProgress.type  //Counter
                 )
          default:
              break;
         }
    }else{
        switch(workInProgress.tag){
            case IndeterminateComponent:
                 return mountIndeterminateComponent(
                    current,
                    workInProgress,
                    workInProgress.type  //Counter
                 )
          default:
              break;
         }
    }
  
}
function updateFunctionComponent(current,workInProgress,Component){
    let newChildren = renderWithHooks(current,workInProgress,Component);
    //根据儿子的
    window.counter = newChildren;
    reconcileChildren(current,workInProgress,newChildren);
    return workInProgress.child;

 }
function mountIndeterminateComponent(current,workInProgress,Component){
       let children= renderWithHooks(current,workInProgress,Component);
       window.counter = children;
       workInProgress.tag=FunctionComponent;
       reconcileChildren(current,workInProgress,children);
       return workInProgress.child;
}

function reconcileChildren(current,returnFiber,nextChildren){
     let childFiber={
         tag:HostComponent,
         type:nextChildren.type
     }
     returnFiber.child=childFiber;
}


