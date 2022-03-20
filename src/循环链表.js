/*
 * @Author: sun_ping
 * @Date: 2022-03-19 10:24:12
 * @LastEditors: sun_ping
 * @LastEditTime: 2022-03-19 10:41:02
 * @Description: 
 */
function dispatchAction(queue,action){
    const update = {action,next:null};
    const pending = queue.pending;
    if(pending===null){
        update.next = update;
    }else{
        update.next = pending.next;
        pending.next = update;
    }
    queue.pending = update;
    
}
let queue = {pending:null};
dispatchAction(queue,'action1')
dispatchAction(queue,'action2')
dispatchAction(queue,'action3')

const pendingQueue = queue.pending;
if(pendingQueue!=null){
    let first = pendingQueue.next;
    let update  = first;
    do{
        console.log(update)
        update = update.next;
    }while(update!==first)
}

