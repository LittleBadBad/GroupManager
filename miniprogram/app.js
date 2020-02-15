//app.js
/*命名规范：
*链接中（页内跳转链接、后台请求链接）的 变量名 与后台数据库统一，小写+简写
*页内变量名统一小写，不缩写
*页内函数名统一开头小写，后面单词首字母大写，不缩写
*/
/*命名统一问题：
*1. 词语/词组表达方式不同，如pid，openid
*2. 何时缩写合适不缩写不统一，如groupid，gid
*3. 对象子属性名称中是否携带其父对象名，divisionlist.dname，divisionlist.name
*/
import GlobalConfig from './pages/config/index'
const globalConfig = new GlobalConfig()
globalConfig.init()
App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    this.globalData = {
      config: globalConfig,
      userinfo:{},
      grouplist:{}
    }
  }
})
