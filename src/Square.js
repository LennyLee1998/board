import React from "react";

// 把格子抽出来作为组件
export default function Square({ onSquareClick, value, isWinner }) {
  // console.log("Square组件重新渲染了");

  // Square的click方法
  function handleButtonClick() {
    onSquareClick();
  }
  return (
    <button
      className={` ${
        isWinner ? "bg-blue-400 !important" : ""
      } text-3xl font-bold mr-1 mb-1 rounded w-16 h-16 bg-white  `}
      onClick={handleButtonClick}
    >
      {value}
    </button>
  );
}
