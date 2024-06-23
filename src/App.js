import { useState } from "react";
import "./App.css";
import Square from "./Square";

export default function History() {
  const [historyValue, setHistoryValue] = useState([Array(9).fill(null)]);
  // 一个指向当前元素的指针, 这个虽然影响了ui,但是完全受到historyValue的影响, 所以不需要使用state
  // currentIndex在两种情况下会发生变化
  // 1.boardClick + 2.buttonClick
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSort, setIsSort] = useState(true);
  function handleHistoryClick(boardValue) {
    const newHistoryValue = historyValue.slice(
      isSort ? 0 : currentIndex,
      isSort ? currentIndex + 1 : historyValue.length - 1
    );
    // 这里有问题
    isSort
      ? newHistoryValue.push(boardValue)
      : newHistoryValue.unshift(boardValue);
    setCurrentIndex(isSort ? newHistoryValue.length - 1 : 0);
    setHistoryValue(newHistoryValue);
  }
  //右边的button渲染
  const renderRightButtons = () => {
    return historyValue.map((item, index) => {
      const btnTContent =
        index === 0 ? "Go to game start" : `Go to move #${index}`;
      const btnFContent =
        index === historyValue.length - 1
          ? "Go to game start"
          : `Go to move #${historyValue.length - index}`;
      return (
        <li key={item} className="button-row">
          <span className="num">{index + 1}. </span>
          <button className="btn" onClick={() => handleButtonClick(index)}>
            {isSort ? btnTContent : btnFContent}
          </button>
          <div className="current-place">
            {index === currentIndex
              ? `You are at move #${historyValue.length - index}`
              : ""}
          </div>
        </li>
      );
    });
  };
  // button的点击事件
  function handleButtonClick(index) {
    console.log("index", index);
    setCurrentIndex(index);
  }
  function handleSortClick() {
    const newHistoryValue = [...historyValue].reverse();
    setIsSort(!isSort);
    setHistoryValue(newHistoryValue);
    setCurrentIndex(historyValue.length - currentIndex - 1);
  }
  return (
    <div className="history">
      <Board
        boardValue={historyValue[currentIndex]}
        onHistoryClick={handleHistoryClick}
        currentIndex={currentIndex}
      />
      <ol className="buttons">
        <button className="sort-btn" onClick={handleSortClick}>
          {isSort ? "降序排列" : "升序排列"}
        </button>
        <div>{renderRightButtons()}</div>
      </ol>
    </div>
  );
}

function Board({ boardValue, onHistoryClick, currentIndex }) {
  // console.log("Board重新渲染");
  // 1.构建一个3*3的棋盘
  // 2.让用户可以点击Square
  // 控制子组件X/O的指针
  const isNext = !(currentIndex % 2);
  // 状态提升,判断输赢
  // const [boardValue, setBoardValue] = useState();
  // 子组件onClick事件传回给父组件
  function handleSquareClick(index) {
    // 如果当前的square里面有值, 则无法进行后续操作
    // 如果有赢家了也无法再落子
    if (boardValue[index] || calcWinner(boardValue)) return;
    const newBoardValue = [...boardValue];
    newBoardValue[index] = isNext ? "X" : "O";
    onHistoryClick(newBoardValue);
  }

  // 构建一个3*3的棋盘
  const renderBoard = () => {
    const board = [];
    for (let i = 0; i < 3; i++) {
      const boardRow = [];
      for (let j = 0; j < 3; j++) {
        boardRow.push(
          <Square
            key={i * 3 + j}
            value={boardValue[i * 3 + j]}
            onSquareClick={() => handleSquareClick(i * 3 + j)}
          />
        );
      }
      board.push(
        <div key={i} className="board-row">
          {boardRow}
        </div>
      );
    }
    return board;
  };

  // 顶部的提示
  // 赢了的话提示变成Winner: X
  // 下棋变成Next player: X
  const renderTopTip = () => {
    let topTip = "";
    const winner = calcWinner(boardValue);
    if (winner) {
      topTip = `Winner: ${winner}`;
    } else {
      topTip = `Next player: ${isNext ? "X" : "O"}`;
    }
    return topTip;
  };

  return (
    <div className="app">
      <div className="tip">{renderTopTip()}</div>
      <div>{renderBoard()}</div>
    </div>
  );
}

// 什么时候去判断player的输赢? 每次player点击的时候进行判断
// 通过什么判断输赢 传入boardValue判断是否固定位置上的三个值相等
// 赢了会有什么结果 退出游戏,也就是不能再点击了+给出提示的winner
function calcWinner(board) {
  // 获胜的组合
  const winLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  // 把循环都走一遍,看这里有没有赢家
  for (const line of winLines) {
    const firstSquare = board[line[0]];
    if (
      firstSquare &&
      firstSquare === board[line[1]] &&
      firstSquare === board[line[2]]
    )
      return firstSquare;
  }
  return false;
}
