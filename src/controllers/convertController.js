const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

const uploadsDir = path.join(__dirname, '../../uploads');

exports.convertVideo = (req, res) => {
  const { file, format } = req.body;

  console.log('Convert button pressed.');
  console.log(`File selected: ${file}`);
  console.log(`Format selected: ${format}`);

  if (!file || !format) {
    console.error('Error: File or format not specified');
    return res.status(400).json({ message: 'File or format not specified' });
  }

  const inputPath = path.join(uploadsDir, file);
  const outputPath = path.join(uploadsDir, `converted.${format}`);

  console.log(`Input file path: ${inputPath}`);
  console.log(`Output file path: ${outputPath}`);

  ffmpeg(inputPath)
    .toFormat(format)
    .on('start', (commandLine) => {
      console.log(`FFmpeg process started with command: ${commandLine}`);
    })
    .on('codecData', (data) => {
      console.log(`Input is ${data.audio} audio with ${data.video} video`);
    })
    .on('progress', (progress) => {
      console.log(`Processing: ${progress.percent}% done`);
    })
    .on('end', () => {
      console.log('Conversion finished successfully.');
      res.status(200).json({ message: 'File converted successfully', file: outputPath });
    })
    .on('error', (err, stdout, stderr) => {
      console.error('Error during conversion:', err.message);
      console.error(`FFmpeg stdout: ${stdout}`);
      console.error(`FFmpeg stderr: ${stderr}`);
      res.status(500).json({ message: 'Error during conversion' });
    })
    .save(outputPath);
};