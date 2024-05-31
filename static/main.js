const socket = io("/"); // 클라이언트의 socket, 서버로 이벤트를 보내기(emit) 위해 사용

const videoGrids = document.getElementById("video-grids");

const chat = document.getElementById("chat");
const myVideo = document.createElement("video");
chat.hidden = true; // chat 아이콘을 누르기 전에는 보여주지 않기 위해
myVideo.muted = true;

let = otherUserName = ""; // 다른 유저가 접속했을 때 이름을 할당하는 변수로 사용

window.onload = () => {
    // 제이쿼리를 이용해 모달을 연다
    $(document).ready(function() {
        $("#getCodeModal").modal("show");
    });
};

// connection을 만들고 받는 peer객체
const peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "3030",
});

let myVideoStream;
const peers = {};
const getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

// 채팅창에 입력한 메세지를 전송한다. room.ejs에서 호출
const sendmessage = (text) => {
    if (event.key === "Enter" && text.value != "") {
        socket.emit("messagesend", myname + ' : ' + text.value);
        text.value = "";
        main__chat_window.scrollTop = main__chat_window.scrollHeight;
    }
};

// 카메라와 오디오 사용 권한을 요청하는 메세지를 표시한다
navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: true,
    })
    // 허용하면 MediaStream 객체를 수신 받는다
    .then((stream) => {
        // 다른 메서드에서 영상을 정지 or 재생시킬 때 사용하기 위해 myVideoStream 변수에 할당한다
        myVideoStream = stream;
        // 내 영상을 화면에 그려준다
        addVideoStream(myVideo, stream, myname);

        socket.on("user-connected", (id, username) => { // 서버에서 user-connected 이벤트를 발생 시켰을 때
            console.log("userid:" + id);
            connectToNewUser(id, stream, username); // 해당 유저의 아이디, 스트림, 이름을 connectToNewUser 함수에 인자로 전달하며 호출한다
            socket.emit("tellName", myname); // 서버에 tellName 이벤트를 보내며 내 이름을 알린다(서버는 받아서 AddName 이벤트를 발생시킴)
        });

        socket.on("user-disconnected", (id) => {
            console.log(peers);
            if (peers[id]) peers[id].close();
        });
    });

    
peer.on("call", (call) => { // 다른 유저에게서 call을 받았을 때
    getUserMedia({ video: true, audio: true },
        function(stream) { 
            call.answer(stream); // 내 스트림으로 응답해준다
            const video = document.createElement("video");
            call.on("stream", function(remoteStream) { // 다른 유저의 스트림을 받아서
                addVideoStream(video, remoteStream, otherUserName); // 내 화면에 그린다
            });
        },
        function(err) {
            console.log("Failed to get local stream", err);
        }
    );
});

// 모든 peer 객체는 생성될 때 랜덤하면서 유니크한 아이디를 할당 받는다
peer.on("open", (id) => {
    // 연결이 성립되면 socket을 통해 join-room 이벤트를 발생시킨다. 그와함께 roomId, id, myname을 전달한다
    // roomId은 컨트롤러단에서 v4를 통해, myname은 view단에서 사용자 입력을 통해 생성되어 req query를 통해 전달받고, room.ejs로 전달된 후 최종적으로 main.js에서 아래 코드로 전달됨
    socket.emit("join-room", roomId, id, myname);
});

let ul;
let li;
socket.on("createMessage", (message) => {
    ul = document.getElementById("messageadd");
    li = document.createElement("li");
    li.className = "message";
    li.appendChild(document.createTextNode(message));
    ul.appendChild(li);
});

socket.on("AddName", (username) => {
    otherUserName = username;
    console.log(username);
});

const RemoveUnusedDivs = () => {
    //
    alldivs = videoGrids.getElementsByTagName("div");
    for (let i = 0; i < alldivs.length; i++) {
        e = alldivs[i].getElementsByTagName("video").length;
        if (e == 0) {
            alldivs[i].remove();
        }
    }
};

const connectToNewUser = (userId, streams, myname) => {
    const mediaConnection = peer.call(userId, streams); // 다른 userId 에게 call 하면서 내 streams를 보낸다.
    const video = document.createElement("video");
    mediaConnection.on("stream", (userVideoStream) => { // 다른 유저가 call에 응답할 때 그 유저의 스트림을 보내줌
        addVideoStream(video, userVideoStream, myname);// 받아서 화면에 영상을 그린다
    });
    mediaConnection.on("close", () => {
        video.remove();
        RemoveUnusedDivs();
    });
    peers[userId] = mediaConnection;
};

const cancel = () => {
    $("#getCodeModal").modal("hide");
};

const copy = async() => {
    const roomid = document.getElementById("roomid").innerText;
    await navigator.clipboard.writeText("https://jason-room.name/join/" + roomid);
};
const invitebox = () => {
    $("#getCodeModal").modal("show");
};

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        document.getElementById("mic").style.color = "red";
    } else {
        document.getElementById("mic").style.color = "white";
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
};

// 내 영상의 렌더링을 허용하거나 중지한다
const VideomuteUnmute = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    console.log(myVideoStream.getVideoTracks());
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        document.getElementById("video").style.color = "red";
    } else {
        document.getElementById("video").style.color = "white";
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
};

// 화면 오른쪽 채팅창을 열고 닫는 함수
const showchat = () => {
    if (chat.hidden == false) {
        chat.hidden = true;
    } else {
        chat.hidden = false;
    }
};

// videoEl 태그에 stream을 전달, 영상을 재생한다
const addVideoStream = (videoEl, stream, name) => {
    videoEl.srcObject = stream;
    videoEl.addEventListener("loadedmetadata", () => {
        videoEl.play();
    });
    // name을 전달 받아 내 영상이 그려지는 곳에 함께 렌더링한다
    const h1 = document.createElement("h1");
    const h1name = document.createTextNode(name);
    h1.appendChild(h1name);
    const videoGrid = document.createElement("div");
    videoGrid.classList.add("video-grid");
    videoGrid.appendChild(h1);
    videoGrids.appendChild(videoGrid);
    videoGrid.append(videoEl);
    RemoveUnusedDivs();
    let totalUsers = document.getElementsByTagName("video").length;
    // 유저가 한 명 이상이면 각 비디오 태그의 너비를 줄인다.
    if (totalUsers > 1) {
        for (let index = 0; index < totalUsers; index++) {
            document.getElementsByTagName("video")[index].style.width =
                100 / totalUsers + "%";
        }
    }
};