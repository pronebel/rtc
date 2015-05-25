// Utility function for logging information to the JavaScript console
function log(text) {
    console.log("At time: " + (performance.now() / 1000).toFixed(3) + " --> " + text);
}

var logError= function(err){

    console.log(err);
}

var RTC = {
    init:function(){
        var _nav = navigator;
        navigator.getUserMedia = _nav.getUserMedia ||
        _nav.webkitGetUserMedia ||
        _nav.mozGetUserMedia;




        // Chrome
        if (navigator.webkitGetUserMedia) {
            RTCPeerConnection = webkitRTCPeerConnection;
            // Firefox
        }else if(navigator.mozGetUserMedia){
            RTCPeerConnection = mozRTCPeerConnection;
            RTCSessionDescription = mozRTCSessionDescription;
            RTCIceCandidate = mozRTCIceCandidate;
        }



        log("RTCPeerConnection object: " + RTCPeerConnection);


    },
    getMediaUrl:function(stream){
        if(window.URL){//CHROME
            return window.URL.createObjectURL(stream);
        }else{//firefox.opera
            return stream;
        }
    },
    showLabel:function(stream){//localStream
        if (navigator.webkitGetUserMedia) {
            if (stream.getVideoTracks().length > 0) {
                log('Using video device: ' + stream.getVideoTracks()[0].label);
            }
            if (stream.getAudioTracks().length > 0) {
                log('Using audio device: ' + stream.getAudioTracks()[0].label);
            }
        }
    },
    monitor:function(config,succ,fail){
        succ = succ || function(){};
        fail = fail || function(err){console.log(err);};
        navigator.getUserMedia(config,succ,fail);
    },
    disconnect:function(peerConn){
        if(peerConn){
            peerConn.close();
            peerConn=null;
        }
    }
}

RTC.init();