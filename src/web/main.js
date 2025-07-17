import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { loadModel, transcribe } from '@ricky0123/whisper-web';

// 初始化FFmpeg和Whisper模型
const ffmpeg = createFFmpeg({ log: true });
let whisperModel;

// 页面加载完成初始化
window.onload = async () => {
    await loadFFmpeg();
    await loadWhisperModel();
};

async function loadFFmpeg() {
    if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
        console.log('FFmpeg加载完成');
    }
}

async function loadWhisperModel() {
    whisperModel = await loadModel('base', { webgpu: true }); // 启用WebGPU加速
    console.log('Whisper模型加载完成');
}

// 视频文件输入处理
document.getElementById('videoInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 显示视频预览
    const videoUrl = URL.createObjectURL(file);
    document.getElementById('previewVideo').src = videoUrl;

    // 提取音频并识别
    await extractAudioAndTranscribe(file);
});

async function extractAudioAndTranscribe(videoFile) {
    // 使用FFmpeg提取音频
    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(videoFile));
    await ffmpeg.run('-i', 'input.mp4', '-vn', '-acodec', 'pcm_s16le', '-ar', '16000', 'output.wav');
    const audioData = ffmpeg.FS('readFile', 'output.wav');

    // 使用Whisper识别音频（仅简体中文）
    const result = await transcribe(whisperModel, new Blob([audioData.buffer]), {
        language: 'chinese',
        task: 'transcribe'
    });

    // 显示识别结果到文本框
    document.getElementById('subtitleText').value = result.text;
}

// 导出带字幕的视频
document.getElementById('exportBtn').addEventListener('click', async () => {
    const subtitleText = document.getElementById('subtitleText').value;
    if (!subtitleText) {
        alert('请先编辑字幕文本');
        return;
    }

    // 这里需要实现字幕与视频合成逻辑（示例为简化流程）
    // 实际需使用FFmpeg叠加字幕或Canvas绘制帧
    alert('暂未实现完整合成功能，示例版本仅展示流程');
});