const axios = require('axios');
const fs = require('fs');
const path = require('path');
const xlsx = require('node-xlsx').default;
const utils = require('./utils');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function processCampaigns(campaigns) {
  // 在这里对每页数据进行处理
  return campaigns.map(item => {
    const name = item.name;
    const id = item.id;
    // const spaceId = item.space.spaceId;
    const alias = item.space.alias;
    const participantsCount = item.participants.participantsCount;

    const url = `https://app.galxe.com/quest/${alias}/${id}`
    return [
      name,
      url,
      participantsCount
    ];
  });
}

async function fetchCampaigns() {
  let hasNextPage = true;
  let afterCursor = "-1";  // 起始页
  let pageSize = 100;  // 起始页
  let status = "Active"; // 项目是否过期，值有：null  Active   Expired 
  const allCampaigns = [];
 
  while (hasNextPage) {
    try {
      var params = JSON.stringify({
        "operationName": "CampaignList",
        "variables": {
          "address": "",
          "input": {
            "listType": "Trending",
            "credSources": null,
            "gasTypes": null,
            "types": null,
            "rewardTypes": null,
            "chains": null,
            "isVerified": null,
            "statuses": status,
            "spaceCategories": null,
            "backers": null,
            "first": pageSize,
            "after": afterCursor,
            "searchString": null,
            "claimableByUser": null
          }
        },
        "query": "query CampaignList($input: ListCampaignInput!, $address: String!) {\n  campaigns(input: $input) {\n    pageInfo {\n      endCursor\n      hasNextPage\n      __typename\n    }\n    list {\n      ...CampaignSnap\n      isBookmarked(address: $address)\n      id\n      numberID\n      name\n      childrenCampaigns {\n        id\n        type\n        rewardName\n        rewardInfo {\n          discordRole {\n            guildId\n            guildName\n            roleId\n            roleName\n            inviteLink\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      whitelistInfo(address: $address) {\n        usedCount\n        __typename\n      }\n      watchlistPro {\n        watchListId\n        rewardIconGif\n        rewardIcon\n        rewardCampaign\n        __typename\n      }\n      info\n      useCred\n      formula\n      thumbnail\n      gasType\n      createdAt\n      requirementInfo\n      description\n      enableWhitelist\n      chain\n      startTime\n      status\n      requireEmail\n      requireUsername\n      distributionType\n      endTime\n      rewardName\n      cap\n      loyaltyPoints\n      tokenRewardContract {\n        id\n        address\n        chain\n        __typename\n      }\n      tokenReward {\n        userTokenAmount\n        tokenAddress\n        depositedTokenAmount\n        tokenRewardId\n        tokenDecimal\n        tokenLogo\n        tokenSymbol\n        __typename\n      }\n      space {\n        id\n        name\n        thumbnail\n        alias\n        isVerified\n        __typename\n      }\n      rewardInfo {\n        discordRole {\n          guildId\n          guildName\n          roleId\n          roleName\n          inviteLink\n          __typename\n        }\n        premint {\n          startTime\n          endTime\n          chain\n          price\n          totalSupply\n          contractAddress\n          banner\n          __typename\n        }\n        __typename\n      }\n      participants {\n        participantsCount\n        bountyWinnersCount\n        __typename\n      }\n      recurringType\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment CampaignMedia on Campaign {\n  thumbnail\n  rewardName\n  type\n  gamification {\n    id\n    type\n    __typename\n  }\n  __typename\n}\n\nfragment CampaignSnap on Campaign {\n  id\n  name\n  inWatchList\n  inNewYearWatchList\n  ...CampaignMedia\n  __typename\n}"
      });

      var config = {
        method: 'post',
        url: 'https://graphigo.prd.galaxy.eco/query',
        headers: {
          'accept': '*/*',
          'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'content-type': 'application/json',
          'priority': 'u=1, i',
          'request-id': '5a1c41d8-d863-489b-a7ca-f47d2d9777d1',
          'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site',
          'x-unique-link-id': 'efbde2c3aee204a69b7696d4b10ff31137fe78e3946306284f806e2dfc68b805'
        },
        data: params,
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
      const response = await axios(config);
      console.log(`开始请求第${afterCursor}后数据，数量20`)

      const data = response.data.data;
      const list = data.campaigns.list;
      hasNextPage = data.campaigns.pageInfo.hasNextPage;
      // hasNextPage = false
      afterCursor = data.campaigns.pageInfo.endCursor;

      // console.log(`返回结果：${JSON.stringify(data)}`)
      console.log(`返回结果：本页数据截止${afterCursor}，数量为100条，是否有下一页数据：${hasNextPage}`)

      // 将当前页的数据添加到allCampaigns数组中
      allCampaigns.push(...list);
   
      console.log(`Page fetched with ${list.length} campaigns.`);

      // 如果还有下一页，等待3秒再进行下一次请求
      if (hasNextPage) {
        await delay(3000);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      hasNextPage = false; // If there's an error, stop the loop
    }
  }

  console.log('All pages fetched');
  console.log('Total campaigns fetched:', allCampaigns.length);
  return allCampaigns;
}

fetchCampaigns().then(allCampaigns => {
  // 这里可以对allCampaigns数组进行进一步的处理
  console.log('All campaigns:', allCampaigns.length);
  // fs.writeFileSync('campaigns.json', JSON.stringify(allCampaigns, null, 2), 'utf-8');
  const processedCampaigns = processCampaigns(allCampaigns);
  
  var buffer = xlsx.build([{ name: 'galxe 项目列表', data: [['项目名', '项目地址', '参与人数'], ...processedCampaigns] }]);

  let formattedDateTime = utils.getCurrentDateTimeFormatted();
  const pathDir = `./galxe 项目列表${formattedDateTime}.xlsx`
  var filePath = path.join(__dirname, pathDir); // 存储路劲和文件名
  fs.writeFileSync(filePath, buffer, { 'flag': 'w' });
  console.log(`文件已经生成至:${path.resolve(pathDir)}`)
});
