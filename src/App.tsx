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
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiButton, setShowAiButton] = useState(false);

  /**
   * サブタスクの完了状態を切り替える
   */
  const toggleSubtask = (todoId: string, subtaskId: string) => {
    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id !== todoId) return todo;

        const updatedSubtasks = todo.subtasks.map((subtask) =>
          subtask.id === subtaskId
            ? { ...subtask, completed: !subtask.completed }
            : subtask
        );

        // 全サブタスクが完了済みかチェック
        const allSubtasksCompleted =
          updatedSubtasks.length > 0 &&
          updatedSubtasks.every((subtask) => subtask.completed);

        // サブタスクに未完了があるかチェック
        const hasIncompleteSubtasks = updatedSubtasks.some(
          (subtask) => !subtask.completed
        );

        // 親タスクの完了状態を決定
        let parentCompleted = todo.completed;
        if (allSubtasksCompleted && !todo.completed) {
          // 全サブタスク完了 → 親タスクも自動完了
          parentCompleted = true;
        } else if (hasIncompleteSubtasks && todo.completed) {
          // サブタスクに未完了がある → 親タスクも未完了に
          parentCompleted = false;
        }

        return {
          ...todo,
          subtasks: updatedSubtasks,
          completed: parentCompleted,
        };
      })
    );
  };

  /**
   * メインタスクの完了状態を切り替える
   */
  const toggleTodo = (todoId: string) => {
    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id !== todoId) return todo;

        const newCompleted = !todo.completed;

        // 親タスクを完了にする場合、全サブタスクも完了にする
        const updatedSubtasks = newCompleted
          ? todo.subtasks.map((subtask) => ({ ...subtask, completed: true }))
          : todo.subtasks.map((subtask) => ({ ...subtask, completed: false }));

        return {
          ...todo,
          completed: newCompleted,
          subtasks: updatedSubtasks,
        };
      })
    );
  };

  /**
   * 入力値の変更ハンドラー
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputvalue(value);
    setShowAiButton(value.trim().length > 0 && !isAiLoading);
  };

  /**
   * AIでタスク分解するハンドラー
   */
  const handleAiBreakdown = async () => {
    if (!inputvalue.trim() || isAiLoading) return;

    const taskTitle = inputvalue.trim();
    const tempId = Date.now().toString();

    // ローディング状態のタスクカードを即座に追加
    const loadingTodo: Todo = {
      id: tempId,
      title: taskTitle,
      completed: false,
      subtasks: [], // 空のサブタスク（ローディング中）
    };

    setTodos((prev) => [loadingTodo, ...prev]);
    setInputvalue("");
    setShowAiButton(false);
    setIsAiLoading(true);

    try {
      const subtaskTitles = await breakdownTask(taskTitle);

      // ローディングカードを完成したタスクに更新
      const completedTodo: Todo = {
        id: tempId,
        title: taskTitle,
        completed: false,
        subtasks: subtaskTitles.map((title, idx) => ({
          id: `${tempId}-${idx}`,
          title,
          completed: false,
        })),
      };

      setTodos((prev) =>
        prev.map((todo) => (todo.id === tempId ? completedTodo : todo))
      );
    } catch (error) {
      // エラー時はローディングカードを削除
      setTodos((prev) => prev.filter((todo) => todo.id !== tempId));
      console.error("タスク分解に失敗しました:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  /**
   * タスクを削除するハンドラー
   */
  const deleteTodo = (todoId: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== todoId));
  };

  /**
   * 通常のTODO追加ハンドラー（サブタスクなし）
   * @param e - フォーム送信イベント
   */
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputvalue.trim() || isAiLoading) return;

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
        <div className="form-container">
          <form className="add-form" onSubmit={handleAddTodo}>
            <input
              type="text"
              placeholder="新しいタスクを入力"
              value={inputvalue}
              onChange={handleInputChange}
              disabled={isAiLoading}
            />
            <button type="submit" className="add-button" disabled={isAiLoading}>
              <PlusIcon />
              追加
            </button>
          </form>
          {showAiButton && (
            <button
              type="button"
              className="ai-breakdown-button-full"
              onClick={handleAiBreakdown}
              disabled={isAiLoading}
            >
              <span className="ai-icon">✨</span>
              AIで分解して追加
            </button>
          )}
        </div>
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
                    onClick={() => deleteTodo(todo.id)}
                    title="タスクを削除"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>

              <div className="subtasks-container">
                {todo.subtasks.length === 0 && isAiLoading ? (
                  <div className="ai-loading-card">
                    <div className="ai-loading-spinner"></div>
                    <span className="ai-loading-text">
                      AIがタスクを分解中...
                    </span>
                  </div>
                ) : (
                  todo.subtasks.map((subtask) => (
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
                  ))
                )}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

export default App;
