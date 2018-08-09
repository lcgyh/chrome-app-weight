

$(function(){
  console.log(chrome.serial)
  var chooselist=null  //选择的设备
  var bitrate=1200
  var connectionId=null //连接设备id
  var newstringReceived


  //链接状态
  // chrome.serial.getInfo('oaolhcgompiokehjkboafckemmhijjnk',function(info){
  //     console.log(info)
  // })



  //获取设备
  $('#J_devices').on('click',function(){
    console.log('获取/刷新设备')
    $('.devicesbox select option').remove()
    chrome.serial.getDevices(function(devices){
        console.log(devices)
        chooselist=devices[0].path
        console.log(chooselist)
        for (var i = 0; i < devices.length; i++) {
          $('.devicesbox select').append("<option value ="+devices[i].path+">"+devices[i].path+"</option>")
        }
    })
  })

  //设备选择
  $('#J_se1').change(function(){
       chooselist=$("#J_se1").val();
  })

  //波特率选择
  $('#J_se2').change(function(){
       var bitrate=Number($("#J_se2").val());
  })

  //设备连接
  $('#J_connect').on('click',function(){
      var connectoption={'bitrate':bitrate}
      chrome.serial.connect(chooselist,connectoption,function(info){
        console.log('连接成功')
        $('#J_connectstate').html("链接状态：设备链接成功")
        connectionId=info.connectionId
      })
  })


  //断开设备
  $('#J_disconnect').on('click',function(){
      chrome.serial.disconnect(connectionId, function(result){
      if (result) {
        console.log("已经断开串行端口连接");
        connectionId=null
        chooselist=null
        bitrate=1200
        newstringReceived=null
        $('#J_connectstate').html("链接状态：设备链接已断开")
      } else {
        $('#J_connectstate').html("链接状态：设备链接断开失败")
        console.log("断开连接失败");
      }
    });
  })

  //设备接收数据转换字符串
  function convertArrayBufferToString(buf){
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  }


  //读取设备数据
  var stringReceived = '';
  var onReceiveCallback = function(info) {
  console.log(info)
    if (info.connectionId == connectionId) {
      var str = convertArrayBufferToString(info.data);
      console.log(str)
      if (str.charAt(str.length-1) === '\n') {
        stringReceived += str.substring(0, str.length-1);
        console.log(stringReceived)
        //判断新接收到的stringReceived是否和上次相等，如果相等，则不再监听，如果不相等则继续执行
         newstringReceived=stringReceived.substring(2,stringReceived.length-4)
         console.log(newstringReceived)
          stringReceived = '';
      } else {
          stringReceived += str;
      }
    }
  };
  

  

  //方案一
  //监听浏览器端发来的请求
  chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
      if(request.openUrlInEditor){
        console.log(newstringReceived)
        if(newstringReceived){
           sendResponse(String(parseFloat(newstringReceived).toFixed(2)))
         }else{
            sendResponse(null)
         }
      }
  });



  //监听运行时的错误信息
  var onError=function(info){
    console.log(info)
    if(info.error){
         chrome.serial.disconnect(connectionId, function(result){
          if (result) {
            console.log("已经断开串行端口连接");
            connectionId=null
            chooselist=null
            bitrate=1200
            newstringReceived=null
            $('#J_connectstate').html("链接状态：设备链接已断开")
          } else {
            $('#J_connectstate').html("链接状态：设备链接断开失败")
            console.log("断开连接失败");
          }
      });
    }
  }


  //监听电子秤设备数据
  chrome.serial.onReceive.addListener(onReceiveCallback);

  chrome.serial.onReceiveError.addListener(onError)


})


