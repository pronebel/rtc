/* global alert, io, rtcPeerConnection */
var PScope = {};

var rtcPeer;

(function($){
    'use strict';
    var socket;


    /**
     * 设置Video的Stream
     * @param videoDom
     * @param stream
     */
    var setVideoStream=function(videoDom,stream){
        var video = $(videoDom)[0];
        if(video.src){
            URL.revokeObjectURL(video.src);
        }
        video.src= getMediaUrl(stream);
    }


    var getMediaUrl=function(stream){
        if(window.URL){//CHROME
            return window.URL.createObjectURL(stream);
        }else{//firefox.opera
            return stream;
        }
    }


    /**
     * 获取RTC频道
     * @param width
     * @returns {{audio: number, video: number, data: number}}
     */
    var getRtcWidth=function(width){
        width = width || 1;
        return   {
            audio: 60,
            video: 120*width,
            data: 30 * 1000 * 1000
        };
    }

    var hang = function(isRemote){
        if(rtcPeer && rtcPeer.peer && rtcPeer.peer.iceConnectionState !== 'closed'){
            rtcPeer.peer.close();
        }
        if(!isRemote){
            socket.emit('SClose');
        }
    };


    var createRtcPeer=function(){

    }

    var getRtcOption = function(opts){

        var __noop = function(){
            console.log(arguments);
        }

        var options =  {
            bandwidth: getRtcWidth(),
            //attachStream: MediaStream,
            //attachStreams: [MediaStream_1, MediaStream_2, MediaStream_3],

            //offerSDP: offerSDP_sent_from_offerer,

            onICE: function (candidate) {
                //console.log(arguments);
                socket.emit('SIce', candidate);
            },
            onRemoteStream:  function(stream){
                setVideoStream($('#remoteVideo')[0],stream)
            },
            onRemoteStreamEnded:__noop,

            //onOfferSDP: function (offerSDP) {
            //    console.log(arguments);
            //},

            //onAnswerSDP: function (answerSDP) {
            //    console.log(arguments);
            //},

            onChannelMessage: __noop,
            onChannelOpened: function (_RTCDataChannel) {
                console.log(arguments);
                $('#rtcHang').show();
            }
        };

        return $.extend({},options,opts);

    };


    var fnSetOtherIdOk = function(){
        $('#J_btnConnectRemote')
            .off('click')
            .get(0)
            .disabled = true;
        $('#rtcCltBox').show();
    };

    $(document).ready(function(){


        $('#content').val(location.origin);


        $('#J_btnConnectServer').one('click', function(){
            var url= $('#content').val();
            if(!url){
                alert('不能为空!');
                return false;
            }
            socket = io(url);


            /**
             * 接收服务器告知的sid
             */
            socket.once('getId', function(e){
                socket.id = e.id;
                $('#selfId').html(socket.id);
            });

            /**
             * 在socket连接成功后，请求获取 sid
             */
            socket.once('connect', function(){
                socket.emit('getId');
            });

            /**
             * 接收服务器告知的远程ID
             */
            socket.on('CSetRemoteId', function(e){
                $('#J_remoteId').val(e.id);
                fnSetOtherIdOk();
            });

            socket.on('COffer',function(sdp){

                rtcPeer = rtcPeerConnection(getRtcOption({
                    attachStream:PScope.localStream,
                    offerSDP:sdp,
                    onAnswerSDP : function(answerSDP) {
                        console.log(arguments);
                        socket.emit('SAnswer', answerSDP);
                    }
                }));
            });

            socket.on('CAnswer', function(e){
                rtcPeer.addAnswerSDP(e);
            });

            socket.on('CIce', function(e){
                rtcPeer.addICE(e);
            });
            socket.on('CClose', function(){
                hang(true);
            });

            /**
             * 连接本地的视频数据
             */
            getUserMedia({ onsuccess:  function(stream){
                $('#contentBox').hide();
                $('#J_connectArea').show();
                setVideoStream($('#localVideo')[0],stream);
                PScope.localStream = stream;
            }});
        });

        /**
         * 请求打通与第三方的信道
         */
        $('#J_btnConnectRemote').one('click', function(){

            var otherId = $.trim($('#J_remoteId').val());

            if(otherId.length === 0){
                alert('不能为空!');
                return false;
            }else{
                socket.emit('SSetOtherId', {
                    id: otherId
                });
                fnSetOtherIdOk();
            }

        });

        /**
         * 拨通第三方
         */
        $('#rtcCall').on('click', function(){
            if(rtcPeer && rtcPeer.peer && rtcPeer.peer.iceConnectionState !== 'closed'){
                console.log("已在联通中")
                return false;
            }else{
                hang();

                rtcPeer = rtcPeerConnection(getRtcOption({
                    attachStream:PScope.localStream,

                    onOfferSDP : function(offerSDP) {
                        console.log(arguments);
                        socket.emit('SOffer', offerSDP);
                    }
                }));
            }


        });
        /**
         * 挂起
         */
        $('#rtcHang').on('click', hang);

    });
})(window.jQuery);