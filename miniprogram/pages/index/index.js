//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: ''
  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
  },

  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function() {
    
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  //create db record
  doCreateUserInfo: function()
  {
    var latitide = 0;

    wx.cloud.callFunction(
      {
        name: 'compute',
        data:
        {
          a : 2,
          b : 3, 
        },

        success:function(res)
        {
          latitide = res.result.sum;
          console.log('-----');
          console.log(latitide);
          console.log('-----');
        },
        fail: console.error
      }
    )

    const testDB = wx.cloud.database({
      env:'ziyi-test-1979'
    })
    const users = testDB.collection('users')

    users.where({
      _openid:'oO_6Z5dCTIcIHdH897F6Ji8WYJGU',
      age:39
    }).get
    ({
      success:function(res)
      {
        console.log(res.data);
      },

      fail:function(res)
      {
        console.log(res);
      }
    })

    users.add(
      {
        data:
        {
          name: 'cenwenchu',
          age :39,
          birthday: new Date("1979-01-28"),
          sports:[
            "basketball",
            "football",
            "running"
          ],
            location: new testDB.Geo.Point(113, latitide),
            logtime: testDB.serverDate()
        },

        success:function(res)
        {
          console.log(res);
          wx.showToast({
           title: '新增记录成功',
         })
         console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
        },

        fail:function(res)
        {
          wx.showToast({
           icon: 'none',
           title: '新增记录失败'
         })
         console.error('[数据库] [新增记录] 失败：', res)
        }


      }
    )

  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            
            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },

})
