const startBrn = document.getElementById("startBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const handleDownload = () => {
  const a = document.createElement("a");
  a.href = videoFile;
  a.download = "MyRecording.webm";
  document.body.appendChild(a);
  a.click();
};

const handleStop = () => {
  startBrn.innerText = "Download Recording";
  startBrn.removeEventListener("click", handleStop);
  startBrn.addEventListener("click", handleDownload);
  recorder.stop();
};

const handleStart = () => {
  startBrn.innerText = "Stop Recording";
  startBrn.removeEventListener("click", handleStart);
  startBrn.addEventListener("click", handleStop);
  recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  };
  recorder.start();
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { width: 150, height: 150 },
  });
  video.srcObject = stream;
  video.play();
};

init();

startBrn.addEventListener("click", handleStart);
