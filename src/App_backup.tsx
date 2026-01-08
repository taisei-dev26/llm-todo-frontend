import { useState } from "react";
import "./App.css";
import {
  PlusIcon,
  EmptyIcon,
  AIIcon,
  LogoIcon,
  TrashIcon,
  CheckmarkIcon,
} from "./components/Icons";

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
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const keywords: Record<string, string[]> = {
    旅行: [
      "目的地を決める",
      "予算を設定する",
      "宿泊先を予約する",
      "交通手段を手配する",
      "持ち物リストを作成する",
    ],
    買い物: [
      "必要なものをリストアップ",
      "予算を確認",
      "店舗を選ぶ",
      "実際に購入する",
      "レシートを保管する",
    ],
    勉強: [
      "学習目標を設定",
      "教材を準備する",
      "学習スケジュールを作成",
      "実際に学習する",
      "復習と確認テスト",
    ],
    プロジェクト: [
      "要件を整理する",
      "タスクを分解する",
      "スケジュールを作成",
      "実装を進める",
      "レビューとテスト",
    ],
    料理: [
      "レシピを決める",
      "材料をリストアップ",
      "材料を買い出し",
      "下準備をする",
      "調理して完成",
    ],
  };

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

/**
 * AI TODOアプリのメインコンポーネント
 * タスクの追加・完了・削除とAIによるサブタスク分解機能を提供
 */
function App() {
  // TODOリストの状態
  const [todos, setTodos] = useState<Todo[]>([]);
  // 入力フィールドの値
  const [inputValue, setInputValue] = useState("");
  // AI処理中のローディング状態
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 新しいTODOを追加するハンドラー
   * AIによるサブタスク分解を実行し、TODOリストに追加する
   * @param e - フォーム送信イベント
   */
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const subtaskTitles = await breakdownTask(inputValue.trim());
      const newTodo: Todo = {
        id: Date.now().toString(),
        title: inputValue.trim(),
        completed: false,
        subtasks: subtaskTitles.map((title, idx) => ({
          id: `${Date.now()}-${idx}`,
          title,
          completed: false,
        })),
      };
      setTodos((prev) => [newTodo, ...prev]);
      setInputValue("");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * TODOの完了状態をトグルする
   * 親TODOをトグルすると全てのサブタスクも同じ状態に更新される
   * @param todoId - トグル対象のTODO ID
   */
  const toggleTodo = (todoId: string) => {
    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id === todoId) {
          const newCompleted = !todo.completed;
          return {
            ...todo,
            completed: newCompleted,
            subtasks: todo.subtasks.map((s) => ({
              ...s,
              completed: newCompleted,
            })),
          };
        }
        return todo;
      })
    );
  };

  /**
   * サブタスクの完了状態をトグルする
   * 全てのサブタスクが完了すると親TODOも自動的に完了状態になる
   * @param todoId - 親TODO ID
   * @param subtaskId - トグル対象のサブタスク ID
   */
  const toggleSubtask = (todoId: string, subtaskId: string) => {
    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id === todoId) {
          const newSubtasks = todo.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          );
          const allCompleted = newSubtasks.every((s) => s.completed);
          return {
            ...todo,
            subtasks: newSubtasks,
            completed: allCompleted,
          };
        }
        return todo;
      })
    );
  };

  /**
   * TODOを削除する
   * サブタスクも含めて完全に削除される
   * @param todoId - 削除対象のTODO ID
   */
  const deleteTodo = (todoId: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== todoId));
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <LogoIcon />
        </div>
        <h1>AI TODOアプリ</h1>
        <p>AIがタスクを自動で分解して、効率的な実行をサポートします</p>
      </header>

      {/* Add Todo Form */}
      <section className="add-form-container">
        <form className="add-form" onSubmit={handleAddTodo}>
          <input
            type="text"
            placeholder="新しいタスクを入力..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" disabled={!inputValue.trim() || isLoading}>
            <PlusIcon />
            追加
          </button>
        </form>
        {isLoading && (
          <div className="loading-indicator">
            <div className="loading-spinner" />
            AIがタスクを分解中...
          </div>
        )}
      </section>

      {/* Todo List or Empty State */}
      {todos.length === 0 ? (
        <section className="empty-state">
          <div className="empty-state-icon">
            <EmptyIcon />
          </div>
          <h3>タスクがありません</h3>
          <p>上のフォームから新しいタスクを追加してみましょう</p>
        </section>
      ) : (
        <section className="todo-list">
          {todos.map((todo) => (
            <div key={todo.id} className="todo-item">
              <div
                className={`todo-checkbox ${todo.completed ? "checked" : ""}`}
                onClick={() => toggleTodo(todo.id)}
              >
                {todo.completed && <CheckmarkIcon />}
              </div>
              <div className="todo-content">
                <div
                  className={`todo-title ${todo.completed ? "completed" : ""}`}
                >
                  {todo.title}
                </div>
                {todo.subtasks.length > 0 && (
                  <div className="todo-subtasks">
                    {todo.subtasks.map((subtask) => (
                      <div key={subtask.id} className="subtask-item">
                        <div
                          className={`subtask-checkbox ${
                            subtask.completed ? "checked" : ""
                          }`}
                          onClick={() => toggleSubtask(todo.id, subtask.id)}
                        >
                          {subtask.completed && <CheckmarkIcon />}
                        </div>
                        <span
                          className={`subtask-text ${
                            subtask.completed ? "completed" : ""
                          }`}
                        >
                          {subtask.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="todo-delete"
                onClick={() => deleteTodo(todo.id)}
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </section>
      )}

      {/* AI Info Card */}
      <section className="ai-info-card">
        <AIIcon />
        <div className="ai-info-content">
          <h3>AI機能について</h3>
          <p>
            このデモではモックのAI応答を使用しています。実際のLLM
            API（OpenAI、Anthropic等）を統合する場合は、
            breakdownTask関数を実際のAPI呼び出しに置き換えてください。
            試してみるキーワード：「旅行」「買い物」「勉強」「プロジェクト」「料理」
          </p>
        </div>
      </section>
    </div>
  );
}

export default App;
