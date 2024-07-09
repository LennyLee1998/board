import { useEffect, useState } from "react";
import "./index.css";
import Square from "./Square";

export default function History() {
  const [historyValue, setHistoryValue] = useState([Array(9).fill(null)]);
  // 一个指向当前元素的指针, 这个虽然影响了ui,但是完全受到historyValue的影响, 所以不需要使用state
  // currentIndex在两种情况下会发生变化
  // 1.boardClick + 2.buttonClick
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isSort, setIsSort] = useState(true);
  // 控制子组件X/O的指针 isNext=> true => X
  const isNext = isSort
    ? !(currentIndex % 2)
    : historyValue.length % 2
    ? !(currentIndex % 2)
    : currentIndex % 2;

  const isFull = historyValue.length === 10;

  // historyValue.length % 2
  function handleHistoryClick(boardValue) {
    const newHistoryValue = isSort
      ? historyValue.slice(0, currentIndex + 1).concat([boardValue])
      : [boardValue].concat(
          // The slice() method of Array instances returns a shallow copy of a portion of an array into a new array object selected from start to end (end not included)
          historyValue.slice(currentIndex, historyValue.length)
        );

    setCurrentIndex(isSort ? newHistoryValue.length - 1 : 0);
    setHistoryValue(newHistoryValue);
  }

  //右边的button渲染
  const renderRightButtons = () => {
    return historyValue.map((item, index) => {
      // 创建了一个指针
      const moveNumber = isSort ? index : historyValue.length - 1 - index;
      const buttonContent =
        moveNumber === 0 ? "Go to game start" : `Go to move #${moveNumber}`;
      const currentPlaceText =
        index === currentIndex ? `You are at move #${moveNumber}` : "";

      return (
        <li key={item} className="mt-1 flex items-center ">
          <span className="mr-1 text-right w-5">{index + 1}. </span>
          <button className="w-30" onClick={() => handleButtonClick(index)}>
            {buttonContent}
          </button>
          <div className="ml-1">{currentPlaceText}</div>
        </li>
      );
    });
  };
  // button的点击事件
  function handleButtonClick(index) {
    //   console.log("index", index);
    setCurrentIndex(index);
  }

  function handleSortClick() {
    const newHistoryValue = [...historyValue].reverse();
    setIsSort(!isSort);
    setHistoryValue(newHistoryValue);
    setCurrentIndex(newHistoryValue.length - currentIndex - 1);
  }
  // restart game button click
  function handleResClick() {
    // 重置currentIndex和historyValue
    setCurrentIndex(0);
    setHistoryValue([Array(9).fill(null)]);
  }
  return (
    <div className="bg-red-400 h-full flex flex-col items-center justify-center">
      <div className="text-white font-bold text-2xl mb-1">Tic-Tac-Toe</div>
      <Board
        boardValue={historyValue[currentIndex]}
        onHistoryClick={handleHistoryClick}
        currentIndex={currentIndex}
        isNext={isNext}
        isFull={isFull}
      />
      {/* <ol className="buttons">
        <button className=" " onClick={handleSortClick}>
          {isSort ? "降序排列" : "升序排列"}
        </button>
        <div>{renderRightButtons()}</div>
      </ol> */}
      <div
        onClick={handleResClick}
        className="text-white bg-teal-800 p-2 rounded mt-2 cursor-pointer"
      >
        Restart Game
      </div>
    </div>
  );
}

function Board({ boardValue, onHistoryClick, isNext, isFull }) {
  // console.log("Board重新渲染");
  // 1.构建一个3*3的棋盘
  // 2.让用户可以点击Square
  // 状态提升,判断输赢
  // const [boardValue, setBoardValue] = useState();
  // 子组件onClick事件传回给父组件
  // 2024.6.26 用来记录当前的赢得line
  const [winLine, setWinline] = useState([]);

  // boardValue变化则需要进行判断
  useEffect(() => {
    // 类型缩小
    if (calcWinner(boardValue)) {
      setWinline(calcWinner(boardValue).line);
    } else {
      setWinline([]);
    }
  }, [boardValue]);

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
            isWinner={winLine?.includes(i * 3 + j)}
            key={i * 3 + j}
            value={boardValue[i * 3 + j]}
            onSquareClick={() => handleSquareClick(i * 3 + j)}
          />
        );
      }
      board.push(
        <div key={i} className="flex ">
          {boardRow}
        </div>
      );
    }
    return board;
  };

  // 顶部的提示
  // 赢了的话提示变成Winner: X
  // 下棋变成Next player: X
  const renderBtTip = () => {
    let topTip = "";
    const winner = calcWinner(boardValue);
    if (winner) {
      topTip = `Winner: ${winner?.firstSquare}`;
    } else {
      // 当所有格子填满但是又没有人赢的时候是平局
      // const winRes = useMemo(() => , [boardValue])
      topTip = isFull ? "It Is A Draw" : `Next player: ${isNext ? "X" : "O"}`;
    }
    return topTip;
  };

  return (
    <div className="flex flex-col  items-center">
      <div className="">
        <div className="h-5/6">{renderBoard()}</div>
      </div>
      <div className="text-white text-left">
        <span>{renderBtTip()}</span>
        {/* <span className="ml-1 flex">{drawMesg}</span> */}
      </div>
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
      return { firstSquare, line };
  }
  return false;
}
