// 写経用ファイル

import { useEffect, useState } from "react";
import "./App.css";
import { EmptyIcon, LogoIcon, PlusIcon } from "./components/Icons";
import { translateText } from "./api";


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
  // 非同期待機
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // キーワード辞書
  const keywords: Record<string, string[]> = {
    旅行: [
      "目的地を決める",
      "予算を設定する",
      "宿泊先を予約する",
      "交通手段を手配する",
      "持ち物リストを作成する",
    ],
  };

  // キーワードマッチング
  for (const [keyword, subtasks] of Object.entries(keywords)) {
    if (task.includes(keyword)) {
      return subtasks;
    }
  }

  return [
    `${task}の計画を立てる`,
    `必要なリソースを確認`,
    `${task}を実行`,
    "結果を確認する",
  ];
};

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputvalue, setInputvalue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // APIの動作確認
  useEffect(() => {
    const testApi = async () => {
      try {
        console.log("APIコール開始")
        const result = await translateText("I am Ueda", "Japanese")
        console.log("翻訳結果:", result)
      } catch (error) {
        console.error("APIエラー:", error)
      }
    }
    testApi()
  })

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
      const subtaskTitles = await breakdownTask(inputvalue.trim());
      const newTodo: Todo = {
        id: Date.now().toString(),
        title: inputvalue.trim(),
        completed: false,
        subtasks: subtaskTitles.map((title, idx) => ({
          id: `${Date.now()}-${idx}`,
          title,
          completed: false,
        })),
      };
      setTodos((prev) => [newTodo, ...prev]);
      setInputvalue("");
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
        <form className="add-form" onSubmit={handleAddTodo}>
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

      {todos.length === 0 ? (
        <section className="empty-state">
          <div className="empty-state-icon">
            <EmptyIcon />
          </div>
          <h3>タスクがありません</h3>
          <p>上のフォームから新しいタスクを追加してみましょう</p>
        </section>
      ) : (
        <section>タスクあります</section>
      )}
    </div>
  );
}

export default App;
