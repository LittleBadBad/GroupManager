// pages/members/divmember/divmember.js
Page({

  data: {
    mygroup:'',//我在本社团中的信息
    mydivision:'',//我在本部门中的信息
    thisdivision:'',//本部门的信息

    goupid:'',
    ischairman:0,
    divmember:'',
    useropenid:'',    

    //部员弹窗
    i:'',
    divmemchosed:'',
    divmemclkd:0,
    showpicker:0,
    statuslist:['部长','副部','部员'],
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
        // goupid:options.gid,
        // ischairman:options.ischairman=='true',
        mydivision:data.mydivision,
        divmember:data.divmember,
        mygroup:data.group,
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
    /**
     *1. 本人在社团中的权限 
     *2. 本人在本部门中的权限
     *3. 本部门副部的权限
     **/
    var mygroup=this.data.mygroup
    var mydivision=this.data.mydivision
    //1. 不可修改本人，2. 主席能改 部长 副部长 部员 3. 部长能改 副主席 部员 4. 其余人不具备此权限
    if(i==0 ? 0:(mygroup.ischairman||Number(mygroup.auth[6])||Number(mydivision.status=='部长'))){
      var statuslist=['部长','副部','部员']
      if(Number(mygroup.auth[6])||mygroup.ischairman)
        statuslist=['部长','副部','部员']
      else
        statuslist=['副部','部员']
      this.setData({
        showpicker:1,
        statuslist:statuslist
      })
    }

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