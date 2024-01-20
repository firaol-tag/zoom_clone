const socket = io("/");
const myPeer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "9000",
});
const peers = {};
const videoGrid = document.getElementById("videosection");
const myVideo = document.createElement("video");
myVideo.muted = true;
let myStream;

navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then((stream) => {
    myStream = stream;
    addVideo(myVideo, stream);
    myPeer.on("call", function (call) {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", function (userVideoStream) {
        addVideo(video, userVideoStream);
      });
    });
    socket.on("joined", (userId) => {
      handleJoined(userId, stream);
    });
  });
let text = $("input");
$("html").keydown(function (e) {
  if (e.which == 13 && text.val().length != 0) {
    socket.emit("message", text.val());
    text.val("");
  }
});
socket.on("createmessage", (message) => {
  $("ul").append(`<li class="message"> <b>user</b><br/>${message} </li>`);
});
myPeer.on("open", (id) => {
  socket.emit("joined-room", RoomId, id);
});

socket.on("user_disconnected", (userId) => {
  if (peers[userId]) {
    console.log("user disconnected");
    peers[userId].close();
  }
});
function addVideo(Video, stream) {
  Video.srcObject = stream;
  Video.addEventListener("loadedmetadata", () => {
    Video.play();
  });
  videoGrid.append(Video);
}
function handleJoined(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", function (userVideoStream) {
    addVideo(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });
  peers[userId] = call;
}
const playstop = () => {
  let enabled = myStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myStream.getVideoTracks()[0].enabled = false;
    setPlayvideo();
  } else {
    setStopvideo();
    myStream.getVideoTracks()[0].enabled = true;
  }
};
const muteunmute = () => {
  let enabled = myStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myStream.getAudioTracks()[0].enabled = false;
    setUnmuteAudio();
  } else {
    setMuteAudio();
    myStream.getAudioTracks()[0].enabled = true;
  }
};
const setMuteAudio = () => {
  const html = `<i class="fa-solid fa-microphone"></i><br />
              <span>mute</span>`;
  document.querySelector(".main_audio_button").innerHTML = html;
};
const setUnmuteAudio = () => {
  const html = `<i class="stop fa-solid fa-microphone-slash"></i><br />
              <span>unmute</span>`;
  document.querySelector(".main_audio_button").innerHTML = html;
};
const setStopvideo = () => {
  const html = `<i class="fa-solid fa-video"></i><br />
              <span>stop video</span>`;
  document.querySelector(".main_video_button").innerHTML = html;
};
const setPlayvideo = () => {
  const html = `<i class="unmute fa-solid fa-video-slash"></i><br />
              <span>play video</span>`;
  document.querySelector(".main_video_button").innerHTML = html;
};
