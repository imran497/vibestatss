import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { PassThrough } from 'stream';
import fs from 'fs';
import path from 'path';

// Tell fluent-ffmpeg where to find the binary
ffmpeg.setFfmpegPath(ffmpegPath);

export async function POST(req) {
    try {
        const body = await req.json();
        const { config, format = 'mp4' } = body;

        if (!config) {
            return NextResponse.json({ error: 'Config is required' }, { status: 400 });
        }

        // Calculate duration and frames
        const fps = 60;
        const duration = config.type === 'follower'
            ? config.followerCount.duration
            : config.dailyUpdate.sequence.length * 2;
        const holdDuration = 6;
        const totalFrames = Math.ceil(fps * (duration + holdDuration));
        const animationFrames = Math.ceil(fps * duration);

        // Launch Puppeteer
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Set viewport to 2x scale (1200x800)
        await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 1 });

        // Navigate to render page
        // We need the host to construct the absolute URL
        const host = req.headers.get('host') || 'localhost:3000';
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const configStr = btoa(JSON.stringify(config));
        const url = `${protocol}://${host}/render?config=${configStr}`;

        console.log('Navigating to:', url);
        await page.goto(url, { waitUntil: 'networkidle0' });

        console.log('FFmpeg Path:', ffmpegPath);

        // Verify FFmpeg path exists
        if (!fs.existsSync(ffmpegPath)) {
            console.error('FFmpeg binary not found at:', ffmpegPath);
            // Fallback: try to find it in node_modules relative to CWD
            const localPath = path.join(process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg');
            console.log('Trying local path:', localPath);
            if (fs.existsSync(localPath)) {
                ffmpeg.setFfmpegPath(localPath);
            } else {
                throw new Error(`FFmpeg binary not found at ${ffmpegPath} or ${localPath}`);
            }
        }

        // Prepare streams
        const imageStream = new PassThrough();
        const tempFilePath = path.join(process.cwd(), `temp-${Date.now()}.mp4`);

        const ffmpegCommand = ffmpeg()
            .input(imageStream)
            .inputFormat('image2pipe')
            .inputFPS(fps)
            .output(tempFilePath) // Write to file instead of pipe
            .outputOptions([
                '-c:v libx264',
                '-preset medium',
                '-crf 18', // High quality
                '-pix_fmt yuv420p', // Ensure compatibility
                '-movflags +faststart'
            ])
            .on('start', (commandLine) => {
                console.log('Spawned Ffmpeg with command: ' + commandLine);
            })
            .on('codecData', (data) => {
                console.log('Input is ' + data.audio + ' audio ' +
                    'with ' + data.video + ' video');
            })
            .on('progress', (progress) => {
                console.log('Processing: ' + progress.percent + '% done');
            })
            .on('stderr', (stderrLine) => {
                console.log('Stderr output: ' + stderrLine);
            })
            .on('error', (err, stdout, stderr) => {
                console.error('FFmpeg error:', err.message);
                console.error('FFmpeg stdout:', stdout);
                console.error('FFmpeg stderr:', stderr);
            })
            .on('end', () => {
                console.log('FFmpeg processing finished');
            });

        ffmpegCommand.run(); // Start processing

        // Start processing frames
        await (async () => {
            try {
                // Handle pipe errors
                imageStream.on('error', (e) => {
                    if (e.code !== 'EPIPE') {
                        console.error('FFmpeg input stream error:', e);
                    }
                });

                // We need to access the internal state of the Preview component
                // Since we can't easily access React state from outside, we'll rely on
                // exposing a global function or just re-implementing the logic?
                // Actually, we can't easily control the React state from Puppeteer unless we expose it.
                // Let's inject a script to expose the setManualProgress function.
                // Wait, we can't easily do that.

                // Better approach: The /render page should accept a 'progress' query param?
                // No, reloading for every frame is too slow.

                // We need to expose a window function in Preview.js.
                // Let's modify Preview.js to expose window.setPreviewProgress

                for (let i = 0; i < totalFrames; i++) {
                    const progress = Math.min(i / (animationFrames - 1), 1);

                    // Update progress via exposed window function
                    await page.evaluate((p, isEnd) => {
                        if (window.setPreviewProgress) {
                            window.setPreviewProgress(p);
                            if (isEnd && window.triggerConfetti) {
                                window.triggerConfetti();
                            }
                        }
                    }, progress, i === animationFrames);

                    // Wait for render (16ms is enough for React to update)
                    // We can use page.waitForFunction to be sure if we add a data attribute
                    await new Promise(r => setTimeout(r, 20));

                    const screenshot = await page.screenshot({ type: 'png', omitBackground: true });

                    if (screenshot.length === 0) {
                        console.warn(`Frame ${i} captured empty screenshot!`);
                    }

                    // Check if stream is writable
                    if (!imageStream.write(screenshot)) {
                        await new Promise(resolve => imageStream.once('drain', resolve));
                    }
                }

                console.log('Finished capturing frames. Ending FFmpeg input.');
                imageStream.end();

                // Wait for FFmpeg to finish
                await new Promise((resolve, reject) => {
                    ffmpegCommand.on('end', resolve);
                    ffmpegCommand.on('error', reject);
                });

                await browser.close();
            } catch (e) {
                console.error('Frame capture error:', e);
                imageStream.end(); // Ensure stream is closed
                await browser.close();
                throw e; // Re-throw to trigger cleanup
            }
        })();

        // Read the temp file
        const videoBuffer = fs.readFileSync(tempFilePath);

        // Cleanup
        fs.unlinkSync(tempFilePath);

        return new NextResponse(videoBuffer, {
            headers: {
                'Content-Type': 'video/mp4',
                'Content-Disposition': `attachment; filename="vibestatss-${Date.now()}.mp4"`,
            },
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
