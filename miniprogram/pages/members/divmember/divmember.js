// pages/members/divmember/divmember.js
Page({

  data: {
    goupid:'',
    ischairman:0,
    divmember:'',
    useropenid:'',
    statuslist:['部长','副部'],

    //部员弹窗
    divmemchosed:'',
    divmemclkd:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //console.log('divmem onload',options)
    const eventChannel = this.getOpenerEventChannel()
    var _this=this
    eventChannel.on('acceptdiv&divMem',function(data){
      _this.setData({
        goupid:options.gid,
        ischairman:options.ischairman=='true',
        division:data.division,
        divmember:data.divmember,
        useropenid:data.useropenid
      })
    })
  },

  onShow(){
    var divmember=this.data.divmember
    for (let i = 0; i < divmember.length; i++) {
      if(divmember[i].pid==this.data.useropenid){
        var membert=divmember[i]
        divmember[i]=divmember[0]
        divmember[0]=membert
        break
      }
    }
    this.setData({divmember:divmember})
  },

  clkDivMem(e){
    let i = e.currentTarget.dataset.index
    var divmemchosed=this.data.divmember[i]
    this.setData({
      divmemchosed:divmemchosed,
      divmemclkd:1
    })
  },

  toggDivMem(){
    this.setData({
      divmemclkd:0
    })
  }

}) 

//  test(){
//     wx.request({
//       url: 'url',//链接
//       data: data,//发送数据
//       dataType: dataType,//数据类型（不必要）
//       header: header,//header（不是post不必要）
//       method: method,//get或post（get：数据写在链接里，post：数据不在链接里，例机密数据或图片）
//       responseType: responseType,//返回类型（不必要）
//       success: (result) => {},//请求成功后返回数据（result）查看处理
//       fail: (res) => {},//请求失败后错误信息（res）查看处理
//       complete: (res) => {},//请求返回过程完成后信息（res）查看处理（不确定请求是否成功时用）
//     })
//   }