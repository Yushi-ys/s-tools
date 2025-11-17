/**
 * 格式化时间戳为相对时间或绝对时间
 * @param timestamp
 * @returns
 */
export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  console.log("formatRelativeTime", now, diff);

  // 1分钟以内
  if (diff < 60 * 1000) {
    return "刚刚";
  }

  // 1分钟到1小时以内
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes}分钟前`;
  }

  // 1小时到24小时以内
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const remainingMinutes = Math.floor(
      (diff % (60 * 60 * 1000)) / (60 * 1000)
    );

    if (remainingMinutes === 0) {
      return `${hours}小时前`;
    } else {
      return `${hours}小时${remainingMinutes}分钟前`;
    }
  }

  // 24小时以上，返回具体日期时间
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
};

/**
 * 随机生成字符
 * @param length
 * @param rules
 * @returns
 */
export const generateRandomString = (length: number, rules: string): string => {
  const characterSets: Record<string, string> = {
    only_num: "0123456789",
    only_letter: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    num_letter:
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  };

  const characters = characterSets[rules] || characterSets.num_letter;

  return Array.from({ length }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join("");
};
