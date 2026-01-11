const API_BASE_URL = "http://localhost:8000";

/**
 * テキストを指定した言語に翻訳する
 */
export const translateText = async (
  text: string,
  targetLanguage: string = "Japanese"
): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/api/translate/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      target_langulage: targetLanguage
    }),
  });

  if (!response.ok) {
    throw new Error("翻訳に失敗しました")
  }

  const data = await response.json()
  return data.translation
}