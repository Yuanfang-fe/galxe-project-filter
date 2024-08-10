const fs = require('fs');
const path = require('path');
var xlsx = require('node-xlsx').default;
const utils = require('./utils');
const axios = require('axios');

const galxeList = xlsx.parse(`${__dirname}/galxe 项目列表20240809-18:34.xlsx`);

const arr = galxeList[0].data.slice(1);

// 目标字符串
const targetString1 = 'Galxe Web3 Score - Humanity Score';
const targetString2 = 'Galxe Passport V2 Holders';
let includeList = [];

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 异步函数，逐个请求并检查字符串
async function fetchAndCheck() {
  for (const [index, data] of arr.entries()) {
    const url = data[1];
    try {
      // const url = `https://app.galxe.com/quest/Borpa/GCxnxtgHZ6`
      var config = {
        method: 'get',
        url: url,
        headers: {},
        proxy: {
          protocol: "http",
          host: '127.0.0.1',
          port: 9876,
          // auth: {
          //   username: 'yourauthusername',
          //   password: '123'
          // }
        }
      };

      const response = await axios(config); // 发送请求并等待响应
      const htmlContent = response.data; // 获取网页的HTML内容
      const colors = {
        Reset: "\x1b[0m",
        BgRed: "\x1b[41m",
        BgGreen: "\x1b[42m",
      };

      if (htmlContent.includes(targetString1) || htmlContent.includes(targetString2)) {
        includeList.push(data)
        console.log(`${colors.BgGreen}%s${colors.Reset}`, `${index}__字符串存在于 ${url} 中`);
        fs.writeFileSync('临时筛选出的项目列表.json', JSON.stringify(includeList, null, 2), 'utf-8');
      } else {
        console.log(`${index}__字符串不存在于 ${url} 中`);
      }
      // await delay(100);
    } catch (error) {
      console.error(`${index}__请求 ${url} 失败:`, error.message);
    }
  }
  if (includeList.length) {
    saveToXlsx(includeList, 'score-passport')
  }
}

function saveToXlsx(data, fileName) {
  var buffer = xlsx.build([{ name: 'galxe 项目列表', data: [['项目名', '项目地址', '参与人数'], ...data] }]);

  let formattedDateTime = utils.getCurrentDateTimeFormatted();
  const pathDir = `./galxe 需要-${fileName}-的项目列表${formattedDateTime}.xlsx`
  var filePath = path.join(__dirname, pathDir); // 存储路劲和文件名
  fs.writeFileSync(filePath, buffer, { 'flag': 'w' });
  console.log(`文件已经生成至:${path.resolve(pathDir)}`)
}

// 调用异步函数执行同步循环
fetchAndCheck();