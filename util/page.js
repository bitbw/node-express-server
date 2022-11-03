/**
 * @description: 根据 options 对 allList 分页
 * @param {*} options 开始时间  startTime 结束时间  endTime 分多少页  totalPage 第几页    page
 * @param {*} allList
 * @return {*}
 */
async function parseHaomoPages(options, allList) {
  const { startTime, endTime, totalPage, page } = options
  // 根据开始时间和结束时间的间隔 / totalPage 得到每个分页的时间间隔
  let interval = endTime - startTime
  let curInterval = interval / totalPage
  let curStartTime = startTime + curInterval * (page - 1)
  let curEndTime = startTime + curInterval * page
  let tempList = allList.filter((item) => {
    return item.time >= curStartTime && item.time <= curEndTime
  })
  return tempList
}


module.exports = {
    parseHaomoPages
}