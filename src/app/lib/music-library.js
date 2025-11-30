// Background music library
// You can replace these URLs with your own music files or use royalty-free music from sites like:
// - https://pixabay.com/music/
// - https://www.bensound.com/
// - https://incompetech.com/

export const MUSIC_LIBRARY = {
  none: null,
  music1: '/Music1.mp3',
  music2: '/Music2.mp3',
  music3: '/Music3.mp3',
};

/**
 * Load and decode audio file
 */
export async function loadAudio(musicId) {
  if (!musicId || musicId === 'none') {
    console.log('No music selected');
    return null;
  }

  const url = MUSIC_LIBRARY[musicId];
  if (!url) {
    console.warn('⚠️ Music not found:', musicId);
    return null;
  }

  try {
    console.log('🎵 Loading music:', musicId, 'from', url);
    const response = await fetch(url, { mode: 'cors' });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log('✓ Downloaded:', (arrayBuffer.byteLength / 1024).toFixed(2), 'KB');

    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    console.log('✓ Music loaded:', musicId, '|', audioBuffer.duration.toFixed(2), 'seconds |',
                audioBuffer.sampleRate, 'Hz |', audioBuffer.numberOfChannels, 'channels');
    return { audioBuffer, audioContext };
  } catch (err) {
    console.error('❌ Failed to load music:', musicId, err);
    console.error('   URL:', url);
    console.error('   Error:', err.message);
    return null;
  }
}
