// pages/actions/dutychart/dutychart.js
var app=getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        useropenid:'',
        duty:'',
        memberlist:'',

        chart:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that=this
        const eventChannel = this.getOpenerEventChannel()
        eventChannel.on('getData',function(data){
            var duty=data.duty
            var dutychart=duty.chart
            var pidlist=data.memberlist
            var chart=[]
            var n=0
            for(let i in duty.sln.timelist.start){
                chart[i]=[]
                for(let j in duty.date){
                    chart[i][j]={}
                    //console.log(j)
                    chart[i][j].pidlist=dutychart[n++].split(",")
                    chart[i][j].namelist=[]
                    for(let i2 in chart[i][j].pidlist)
                        for(let j2 in pidlist)
                            if(pidlist[j2].pid==chart[i][j].pidlist[i2])
                                chart[i][j].namelist[i2]=pidlist[j2].name
                }
            }
            console.log(chart)
            that.setData({
                useropenid:data.useropenid,
                duty:data.duty,
                memberlist:pidlist,
                chart:chart
            })
        })
    },

})