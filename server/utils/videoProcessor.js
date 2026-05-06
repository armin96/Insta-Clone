const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// Configure FFmpeg/FFprobe paths
const { execSync } = require('child_process');

// Prefer system FFmpeg if it's installed and in PATH
const configureFFmpeg = () => {
    try {
        console.log('Forcing use of static FFmpeg/FFprobe binaries.');
        const staticFfmpeg = require('ffmpeg-static');
        const staticFfprobe = require('ffprobe-static');

        // Handle object return from static modules
        const ffmpegPath = staticFfmpeg.path || staticFfmpeg;
        const ffprobePath = staticFfprobe.path || staticFfprobe;

        console.log('FFmpeg Path:', ffmpegPath);
        console.log('FFprobe Path:', ffprobePath);

        ffmpeg.setFfmpegPath(ffmpegPath);
        ffmpeg.setFfprobePath(ffprobePath);
    } catch (err) {
        console.error('Failed to configure FFmpeg:', err);
    }
};

configureFFmpeg();

/**
 * Compresses a video and generates a thumbnail
 * @param {string} inputPath - Relative path to the uploaded file
 * @returns {Promise<{videoPath: string, thumbnailPath: string}>}
 */
const processVideo = async (inputPath) => {
    const fullInputPath = path.join(__dirname, '..', inputPath);
    const filename = path.basename(inputPath, path.extname(inputPath));
    const outputDir = path.dirname(fullInputPath);

    const compressedFilename = `compressed-${filename}.mp4`;
    const thumbnailFilename = `thumb-${filename}.jpg`;

    const compressedPath = path.join(outputDir, compressedFilename);
    const thumbnailPath = path.join(outputDir, thumbnailFilename);

    return new Promise((resolve, reject) => {
        console.log('Starting video compression:', inputPath);

        ffmpeg(fullInputPath)
            .outputOptions([
                '-vcodec libx264',
                '-crf 28', // Optimized for high compression with good quality
                '-preset slow', // Better compression at the cost of processing time
                '-profile:v high',
                '-level 4.1',
                '-pix_fmt yuv420p',
                '-movflags +faststart', // Optimized for web streaming
                '-vf scale=-2:1920' // Scale to 1920p height
            ])
            .audioCodec('aac')
            .audioBitrate('128k')
            .on('end', () => {
                console.log('Compression finished. Generating thumbnail...');

                ffmpeg(fullInputPath)
                    .screenshots({
                        timestamps: ['1'],
                        filename: thumbnailFilename,
                        folder: outputDir,
                        size: '640x?'
                    })
                    .on('end', () => {
                        console.log('Thumbnail generated.');
                        const relativeVideoPath = path.join(path.dirname(inputPath), compressedFilename).replace(/\\/g, '/').replace(/\/+/g, '/');
                        const relativeThumbPath = path.join(path.dirname(inputPath), thumbnailFilename).replace(/\\/g, '/').replace(/\/+/g, '/');

                        resolve({
                            videoPath: relativeVideoPath.startsWith('/') ? relativeVideoPath : `/${relativeVideoPath}`,
                            thumbnailPath: relativeThumbPath.startsWith('/') ? relativeThumbPath : `/${relativeThumbPath}`
                        });

                        // Optionally delete original file after small delay
                        // fs.unlink(fullInputPath, () => {});
                    })
                    .on('error', (err) => {
                        console.error('Thumbnail error:', err);
                        reject(err);
                    });
            })
            .on('error', (err) => {
                console.error('Compression error:', err);
                reject(err);
            })
            .save(compressedPath);
    });
};

module.exports = { processVideo };
