// 写経用ファイル

import { useState } from "react";
import "./App.css";
import { EmptyIcon, LogoIcon, PlusIcon, TrashIcon } from "./components/Icons";
import { breakdownTask } from "./api";

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

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputvalue, setInputvalue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAiButton, setShowAiButton] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  /**
   * サブタスクの完了状態を切り替える
   */
  const toggleSubtask = (todoId: string, subtaskId: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              subtasks: todo.subtasks.map((subtask) =>
                subtask.id === subtaskId
                  ? { ...subtask, completed: !subtask.completed }
                  : subtask
              ),
            }
          : todo
      )
    );
  };

  /**
   * メインタスクの完了状態を切り替える
   */
  const toggleTodo = (todoId: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  /**
   * 入力値の変更ハンドラー
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputvalue(value);
    setShowAiButton(value.trim().length > 0);
  };

  /**
   * AIでタスク分解するハンドラー
   */
  const handleAiBreakdown = async () => {
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
      setShowAiButton(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 削除確認を表示するハンドラー
   */
  const showDeleteConfirm = (todoId: string) => {
    setDeleteConfirm(todoId);
  };

  /**
   * タスクを削除するハンドラー
   */
  const deleteTodo = (todoId: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== todoId));
    setDeleteConfirm(null);
  };

  /**
   * 削除をキャンセルするハンドラー
   */
  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  /**
   * 通常のTODO追加ハンドラー（サブタスクなし）
   * @param e - フォーム送信イベント
   */
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputvalue.trim() || isLoading) return;

    const newTodo: Todo = {
      id: Date.now().toString(),
      title: inputvalue.trim(),
      completed: false,
      subtasks: [],
    };
    setTodos((prev) => [newTodo, ...prev]);
    setInputvalue("");
    setShowAiButton(false);
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
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="新しいタスクを入力"
              value={inputvalue}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            {showAiButton && (
              <button
                type="button"
                className="ai-breakdown-button"
                onClick={handleAiBreakdown}
                disabled={isLoading}
              >
                <span className="ai-icon">✨</span>
                AIで分解
              </button>
            )}
          </div>
          <button type="submit" className="add-button" disabled={isLoading}>
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
        <section className="todos-container">
          {todos.map((todo) => (
            <div key={todo.id} className="todo-card">
              <div className="todo-header">
                <div className="todo-title-section">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="todo-checkbox"
                  />
                  <h3
                    className={`todo-title ${
                      todo.completed ? "completed" : ""
                    }`}
                  >
                    {todo.title}
                  </h3>
                </div>
                <div className="todo-actions">
                  {todo.subtasks.length > 0 && (
                    <div className="todo-progress">
                      {todo.subtasks.filter((st) => st.completed).length} /{" "}
                      {todo.subtasks.length}
                    </div>
                  )}
                  <button
                    className="todo-delete"
                    onClick={() => showDeleteConfirm(todo.id)}
                    title="タスクを削除"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>

              <div className="subtasks-container">
                {todo.subtasks.map((subtask) => (
                  <div key={subtask.id} className="subtask-item">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => toggleSubtask(todo.id, subtask.id)}
                      className="subtask-checkbox"
                    />
                    <span
                      className={`subtask-title ${
                        subtask.completed ? "completed" : ""
                      }`}
                    >
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 削除確認ダイアログ */}
      {deleteConfirm && (
        <div className="delete-modal-overlay" onClick={cancelDelete}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <h3>タスクを削除しますか？</h3>
            </div>
            <div className="delete-modal-content">
              <p>{todos.find((t) => t.id === deleteConfirm)?.title}</p>
              <p className="delete-warning">この操作は取り消せません。</p>
            </div>
            <div className="delete-modal-actions">
              <button className="cancel-button" onClick={cancelDelete}>
                キャンセル
              </button>
              <button
                className="delete-button"
                onClick={() => deleteTodo(deleteConfirm)}
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
