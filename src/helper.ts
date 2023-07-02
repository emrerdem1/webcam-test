let $stream: MediaStream;

export const init = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    setupCamera(stream);
    getVideoDevices();
  } catch (e) {
    console.error('navigator.getUserMedia error:', e);
    document.querySelector('.webcamStatus')!.innerHTML = `
      <div>Kameraya izin verilmedi veya desteklenmiyor.</div>
    `;
  }
};

const printStream = (stream: MediaStream) => {
  console.log(stream);
  console.log(stream.getVideoTracks());
};

export const setupCamera = async (stream: MediaStream) => {
  $stream = stream;
  printStream(stream);
  updateCameraStatus(stream);
  const video = document.querySelector<HTMLVideoElement>('#webcam')!;
  video.srcObject = $stream;
  video.onloadedmetadata = () => {
    video.play();
  };
  video.onended = () => {
    if (!$stream) return;

    $stream.getVideoTracks().forEach((track) => track.stop());
  };
};

export const updateCameraStatus = async (stream: MediaStream) => {
  try {
    const isEnabled = stream.getVideoTracks().some((t) => t.enabled);
    const isConnected = stream.getVideoTracks().some((t) => t.readyState === 'live');
    // A stream is considered active if at least one of its MediaStreamTrack
    // does not have its property MediaStreamTrack.readyState set to ended.
    // Once every track has ended, the stream's active property becomes false.
    const isActive = stream.active;
    document.querySelector('.webcamStatus')!.innerHTML = `
      <div>Kamera bağlandı mı: ${getBoolText(isConnected)}</div>
      <div>Stream aktif mi: ${getBoolText(isActive)}</div>
      <div>Stream'ı Render etme izni var mı: ${getBoolText(isEnabled)}</div>
    `;
  } catch (e) {
    console.error('hasAvailableCamera error:', e);
  }
};

export const setupDomEvents = () => {
  const pause = document.querySelector<HTMLButtonElement>('#pause')!;
  const restart = document.querySelector<HTMLButtonElement>('#restart')!;

  pause.addEventListener('click', () => {
    if (!$stream) return;

    printStream($stream);
    $stream.getVideoTracks().forEach((track) => track.stop());
    updateCameraStatus($stream);
    printStream($stream);
  });

  restart.addEventListener('click', async () => {
    if (!$stream) return;

    init();
  });
};

const getBoolText = (bool: boolean) => {
  return bool ? `<span style="color: green;">Evet</span>` : `<span style="color: red;">Hayır</span>`;
};

const getVideoDevices = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter((device) => device.kind === 'videoinput');
  const infoText = document.querySelector('.webcamInfo')!;
  if (videoDevices.length === 0) {
    infoText.innerHTML = 'No video input devices found';
    return;
  }

  infoText.innerHTML = `
    ${videoDevices.map((device) => device.label).join('--')}
  `;
};
