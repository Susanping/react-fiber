/*
 * @Author: sun_ping
 * @Date: 2022-03-19 11:05:49
 * @LastEditors: sun_ping
 * @LastEditTime: 2022-03-19 22:19:13
 * @Description: 
 */
import {beginWork} from './ReactFiberBeginWork'
let workInProgress = null;
function performUnitOfWork(unitOfWork){
    let current = unitOfWork.alternate;
    return beginWork(current,unitOfWork)
}
function workLoop(){
     while(workInProgress){
        workInProgress = performUnitOfWork(workInProgress)
     }
}
export function scheduleUpdateOnFiber(fiber){
    let newFiber={
        ...fiber,
        alternate:fiber
    }
    debugger
    /**
     * 
     *  alternate: {tag: 0, alternate: null, memoizedState: {…}, child: {…}, type: ƒ}
        child: {tag: 5, type: 'div'}
        memoizedState: {memoizedState: 0, queue: {…}, next: null}
        tag: 0
        type: ƒ Counter()
     */
    workInProgress =newFiber;
    workLoop()
}

export function render(fiber){
    workInProgress =fiber;
    workLoop()
}