const fs = require('fs');
const path = require('path');

function getLastModifiedFileSync(dir) {
  const files = fs.readdirSync(dir);

  if (files.length === 0) {
    return null;
  }

  let lastModifiedFile = null;
  let lastModifiedTime = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isFile() && stats.mtimeMs > lastModifiedTime) {
      lastModifiedTime = stats.mtimeMs;
      lastModifiedFile = filePath;
    }
  });

  return lastModifiedFile;
}

function emptyDirectoryFiles(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory "${dir}" does not exist.`);
    return;
  }

  fs.readdirSync(dir).forEach(file => {
    const currentPath = path.join(dir, file);

    if (fs.lstatSync(currentPath).isFile()) {
      // Delete file
      fs.unlinkSync(currentPath);
      console.log(`File "${file}" deleted.`);
    }
  });

  console.log(`All files in directory "${dir}" have been deleted.`);
}

function getCurrentDateTimeFormatted() {
  let now = new Date();

  let year = now.getFullYear();
  let month = now.getMonth() + 1; // 月份从 0 开始，所以要加 1
  let day = now.getDate();
  let hours = now.getHours();
  let minutes = now.getMinutes();

  // 格式化月份和日期为两位数
  let formattedMonth = month < 10 ? `0${month}` : `${month}`;
  let formattedDay = day < 10 ? `0${day}` : `${day}`;
  let formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
  let formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

  // 返回格式化后的字符串
  return `${year}${formattedMonth}${formattedDay}-${formattedHours}:${formattedMinutes}`;
}

/**
 * 
 * @param {*} url 
 * // 示例用法
var url1 = "https://www.example.com";
var url2 = "http://not a valid url";

console.log(isValidURL(url1)); // 输出 true
console.log(isValidURL(url2)); // 输出 false
 * @returns 
 */
function isValidURL(url) {
  var pattern = new RegExp('^(https?:\\/\\/)?' + // 协议
    '(([\\w.-]+)\\.([a-z]{2,6}))' + // 域名
    '(:\\d+)?(\\/\\S*)?$', 'i'); // 端口和路径
  return !!pattern.test(url);
}

module.exports = {
  getLastModifiedFileSync,
  emptyDirectoryFiles,
  getCurrentDateTimeFormatted,
  isValidURL
};