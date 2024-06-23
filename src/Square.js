import React from "react";

// 把格子抽出来作为组件
export default function Square({ onSquareClick, value }) {
  // console.log("Square组件重新渲染了");

  // Square的click方法
  function handleButtonClick() {
    onSquareClick();
  }
  return (
    <button className="square" onClick={handleButtonClick}>
      {value}
    </button>
  );
}
