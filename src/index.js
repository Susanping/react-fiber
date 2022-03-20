/*
 * @Author: sun_ping
 * @Date: 2021-07-15 10:18:09
 * @LastEditors: sun_ping
 * @LastEditTime: 2022-03-19 22:09:34
 * @Description: 
 */
// import React, {useState, useReducer, useEffect, useLayoutEffect} from "react";
// import ReactDOM from "react-dom";
// import {useReducer, useEffect, useLayoutEffect} from "./kreact/react";
// import ReactDOM from "./kreact/react-dom";
// import "./index.css";


// function FunctionComponent(props) {
//   const [count1, setCount1] = useReducer((x) => x + 2, 0);
//   const [count2, setCount2] = useReducer((x) => x + 1, 1); // hook2

//   return (
//     <div className="border">
//       <p>{props.name}</p>
//       <p>{count1}</p>
//       <button
//         onClick={() => {
//           setCount1(count1 + 1);
//         }}>
//         click
//       </button>

//       <p>{count2}</p>
//       <button
//         onClick={() => {
//           setCount2(count2 + 1);
//         }}>
//         click
//       </button>
//     </div>
//   );
// }

// const jsx = (
//   <div className="border">
//     <h1>全栈</h1>
//     <a href="https://www.kaikeba.com/">kkb</a>
//     <FunctionComponent name="function" />
//   </div>
// );

// ReactDOM.render(jsx, document.getElementById("root"));

import {IndeterminateComponent} from './ReactWorkTags'
import React from 'react';
import ReactDOM  from 'react-dom';
import { render } from './ReactFiberWorkLoop';
import { useReducer } from './ReactFiberHooks';
const reducer=(state,action)=>{
  if(action.type==='add'){
    return state+1;
  }else{
    return state+2;
  }
}
function Counter(){
  const [number,setNumber] = useReducer(reducer,0)
  // const [number1,setNumber1] = useReducer(reducer,9)
  // const [number2,setNumber2] = useReducer(reducer,80)
  return (
    <div onClick={()=>{
      setNumber({type:'add'});
      setNumber({type:'minus'});
    }}>{number}</div>
  )
}
// ReactDOM.render(<Counter/>,document.getElementById('root'))


let countFiber={
  tag:IndeterminateComponent,
  type:Counter,
  alternate:null
}

render(countFiber)

