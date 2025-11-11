import { generateRandomString } from "@/utils";
import axios from "axios";
import CryptoJS from "crypto-js";

export interface IBaiduTranslateProps {
  q: string; // 待翻译文本，utf-8编码
  from: string; // 原文语言代码
  to: string; // 译文语言代码
}

const getSign = (appid: string, q: string, salt: string, appkey: string) => {
  const sign_str = appid + q + salt + appkey;
  return CryptoJS.MD5(sign_str).toString();
};

export const baiduTranslate = async (props: IBaiduTranslateProps) => {
  const appid = "20251104002490229";
  const salt = generateRandomString(5, "only_num"); // 函数生成的随机码, 可为字母或数字的字符串
  const appkey = "3qqeAFDctR5EwArBswHx";
  const { q, from, to } = props || {};

  const sign = getSign(appid, q, salt, appkey);

  const res = await axios.post("http://localhost:3001/proxy/translate", {
    q,
    from,
    to,
    appid,
    salt,
    sign,
  });
  
  return res;
};
