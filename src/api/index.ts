const API_BASE_URL = "http://localhost:8000";

/**
 * タスクをサブタスクに分解する
 */
export const breakdownTask = async (task: string): Promise<string[]> => {
  const response = await fetch(`${API_BASE_URL}/api/tasks/breakdown`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ task }),
  });
  
  if (!response.ok) {
    throw new Error("タスク分解に失敗しました");
  }
  const data = await response.json();
  return data.subtasks;
}