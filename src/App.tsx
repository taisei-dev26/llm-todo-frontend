// 写経用ファイル

import { useState } from "react";
import { LogoIcon, PlusIcon } from "./components/Icons";

// App_backup.tsx を参考にして、ここにコードを書いてください
interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  subtasks: SubTask[];
}

/**
 * タスクをサブタスクに分解するモックAI関数
 * 特定のキーワードに基づいて事前定義されたサブタスクを返す
 * 実際のLLM APIを使用する場合はこの関数を置き換える
 * @param task - 分解対象のタスク文字列
 * @returns サブタスクのタイトル配列
 */
const breakdownTask = async (task: string): Promise<string[]> => {
  
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputvalue, setInputvalue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 新しいTODOを追加するハンドラー
   * AIによるサブタスク分解を実行し、TODOリストに追加する
   * @param e - フォーム送信イベント
   */
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputvalue.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const newTodo: Todo = {
        id: Date.now().toString(),
        title: inputvalue.trim(),
        completed: false,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <LogoIcon />
        </div>
        <h1>AI TODO</h1>
        <p>AIがタスクを自動で分解して、効率的な実行をサポートします</p>
      </header>

      {/* 入力フォーム */}
      <section className="add-form-container">
        <form className="add-form">
          <input
            type="text"
            placeholder="新しいタスクを入力"
            value={inputvalue}
            disabled={isLoading}
          />
          <button>
            <PlusIcon />
            追加
          </button>
        </form>
      </section>
    </div>
  );
}

export default App;
