using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using VideoStreamingService.Data.ViewModels;
using VideoStreamingService.Models;
using Xabe.FFmpeg;

namespace VideoStreamingService.Data.Services
{
    public class VideoProcessingService : IVideoProcessingService
    {
        private readonly bool useProgress = false;
        private readonly bool reduceBitrate = false;
        private readonly IVideoService _videoService;
        private readonly IAppConfig _config;

        public VideoProcessingService(IVideoService videoService, IAppConfig appConfig)
        {
            _videoService = videoService;
            _config = appConfig;
        }

        public async Task ConvertVideo(string input, CancellationToken ct)
        {
            if (ct.IsCancellationRequested)
                return;
            string path = Path.GetDirectoryName(input);
            IMediaInfo mediaInfo = await FFmpeg.GetMediaInfo(input);

            int height = mediaInfo.VideoStreams.FirstOrDefault().Height;
            await AddResolutions(input, path, mediaInfo, height, ct);

            var files = Directory.GetFiles(path, "*.mp4");
            input = files.Max();
            await ExecutePreviews(mediaInfo, input, ct);

            Debug.WriteLine("All done");
            Statics.RemoveToken(Path.GetFileName(path), Statics.TokenType.Upload);
        }

        private async Task AddResolutions(string input, string path, IMediaInfo mediaInfo, int height,
            CancellationToken ct)
        {
            VideoCodec codec = _config.VideoCodec;
            await AddResolution(mediaInfo, codec, VideoSize.Fwqvga, 65536L, 20, Path.Combine(path, "240.mp4"), ct);
            File.Create(path + "\\240done").Close();
            if (height >= 480)
                await AddResolution(mediaInfo, codec, VideoSize.Hd480, 393216L, 30, Path.Combine(path, "480.mp4"), ct);
            if (height >= 720)
                await AddResolution(mediaInfo, codec, VideoSize.Hd720, 1572864L, 60, Path.Combine(path, "720.mp4"), ct);
            File.Delete(input);
        }

        private async Task AddResolution(IMediaInfo mediaInfo, VideoCodec codec, VideoSize size,
            long bitrate, double framerate, string output, CancellationToken ct)
        {
            try
            {
                if (ct.IsCancellationRequested)
                    return;
                List<IStream> streams = new List<IStream>();
                IVideoStream vStream = mediaInfo.VideoStreams.FirstOrDefault();
                IAudioStream aStream = mediaInfo.AudioStreams.FirstOrDefault();
                int h, w;
                
                ChangeSize(vStream, out h, out w);
                if (vStream.Framerate < framerate)
                {
                    bitrate = Convert.ToInt64(bitrate * (vStream.Framerate / framerate));
                    framerate = vStream.Framerate;
                }
                if (vStream.Bitrate < bitrate && reduceBitrate)
                    bitrate = vStream.Bitrate;

                IStream videoStream = vStream
                    .SetCodec(codec)
                    .SetSize(size)
                    .SetBitrate(bitrate)
                    .SetFramerate(framerate);
                streams.Add(videoStream);
                if (aStream != null)
                {
                    IStream audioStream = aStream
                        .SetCodec(AudioCodec.aac)
                        .SetChannels(2)
                        .SetSampleRate(44100)
                        .SetBitrate(131072L);
                    streams.Add(audioStream);
                }
                try
                {
                    IConversion conversion = FFmpeg.Conversions.New()
                        .AddStream(streams)
                        .AddParameter($"-vf \"pad=width={w}:height={h}:x=-1:y=-1:color=black\"")
                        .SetOutput(output);
                    if (_config.UseGpu)
                        conversion.UseHardwareAcceleration("auto", vStream.Codec, codec.ToString());
                    else
                        conversion.UseMultiThread(true);
                    if (useProgress)
                    {
                        conversion.OnProgress += (sender, args) =>
                        {
                            var percent =
                                (int)(Math.Round(args.Duration.TotalSeconds / args.TotalLength.TotalSeconds, 2) * 100);
                            Debug.WriteLine(
                                $"{Path.GetFileNameWithoutExtension(output)}: [{args.Duration} / {args.TotalLength}] {percent}%");
                        };
                    }
                    await conversion.Start(ct);
                    if (ct.IsCancellationRequested)
                        return;
                    Debug.WriteLine($"{Path.GetFileName(output)} done");
                    await AddVideoInfo(mediaInfo, output);
                }
                catch (Exception ex)
                {
                    Debug.WriteLine(ex.ToString());
                    //if (await DeleteVideo(await VideoByIdAsync(Path.GetFileName(Path.GetDirectoryName(output)))))
                    //	await DeleteDirectory(Path.GetDirectoryName(output));
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
            }
        }

        private static void ChangeSize(IVideoStream vstream, out int h, out int w)
        {
            if ((int)(vstream.Height / 9) == (int)(vstream.Width / 16))
            {
                h = vstream.Height;
                w = vstream.Width;
            }
            else if (vstream.Height / 9 > vstream.Width / 16)
            {
                h = vstream.Height;
                w = (int)(h * 1.777777777777);
            }
            else
            {
                w = vstream.Width;
                h = (int)(w / 1.777777777777);
            }
        }

        private async Task<Video> AddVideoInfo(IMediaInfo mediaInfo, string output) // Добавляет длину и разрешение
        {
            string id = Path.GetFileName(Path.GetDirectoryName(output));
            Video video = await _videoService.VideoByUrlMinInfoAsync(id);
            video.Length = (short)mediaInfo.Duration.TotalSeconds;
            video.Resolution = Convert.ToInt16(Path.GetFileNameWithoutExtension(output));
            
            await _videoService.SaveVideoAsync(video,
                new CancellationTokenSource(TimeSpan.FromSeconds(10)).Token,
                new string[] { "Length", "Resolution" });
            Debug.Print($"{id}: resolution updated to {video.Resolution}p");
            return video;
        }

        public async Task<Video>
            AddVideoInfo(Video video, string webroot) // Добавляет длину и разрешение при сохранении
        {
            string path = Path.Combine(webroot, "Videos", video.Url);
            short res = await GetMaxResolution(path);
            if (res > 0 && res != video.Resolution)
            {
                try
                {
                    if (File.Exists(Path.Combine(path, "original.mp4")) &&
                        Statics.GetToken(video.Url, Statics.TokenType.Upload) == null)
                        File.Delete(Path.Combine(path, "original.mp4"));
                    path = Path.Combine(path, $"{res}.mp4");
                    IMediaInfo mediaInfo = await FFmpeg.GetMediaInfo(path);
                    Video newParamsVideo = await AddVideoInfo(mediaInfo, path);
                    video.Length = newParamsVideo.Length;
                    video.Resolution = newParamsVideo.Resolution;
                }
                catch (Exception)
                { }
            }
            return video;
        }

        public async Task<short> GetMaxResolution(string path)
        {
            short res = 0;
            foreach (string file in Directory.GetFiles(path, "*.mp4").OrderByDescending(p => p))
            {
                try
                {
                    short tmp = Convert.ToInt16(Path.GetFileNameWithoutExtension(file));
                    if (res < tmp)
                    {
                        IMediaInfo tmpMediaInfo = await FFmpeg.GetMediaInfo(file);
                        if (tmpMediaInfo != null)
                            res = tmp;
                    }
                }
                catch (Exception)
                { }
            }
            return res;
        }

        public async Task ExecutePreviews(IMediaInfo mediaInfo, string input, CancellationToken ct)
        {
            if (ct.IsCancellationRequested)
                return;
            IVideoStream vstream = mediaInfo.VideoStreams.FirstOrDefault().SetCodec(VideoCodec.jpeg2000);
            double frame = vstream.Duration.TotalMilliseconds * 0.1;
            for (int i = 0; i < 3; i++)
            {
                string output = Path.Combine(Path.GetDirectoryName(input), i + ".jpg");
                if (File.Exists(output))
                    File.Delete(output);
                IConversion conversion = await
                    FFmpeg.Conversions.FromSnippet.Snapshot(input, output,
                        TimeSpan.FromMilliseconds(frame));
                await conversion.Start();
                frame += vstream.Duration.TotalMilliseconds * 0.3;
            }
            Debug.WriteLine($"Previews done");
        }

        public async Task CreateThumbnail(string folderPath, FileUploadVM video)
        {
            try
            {
                if (!Directory.Exists($"{folderPath}\\{video.Url}"))
                    Directory.CreateDirectory($"{folderPath}\\{video.Url}");
                string path = Path.Combine(folderPath, video.Url, $"3.jpg");
                await using var memoryStream = new MemoryStream();
                await video.File.CopyToAsync(memoryStream);

                Bitmap bitmap = new Bitmap(memoryStream);
                Image image = new Bitmap(bitmap, new Size(1280, 720));
                if (File.Exists(path))
                    File.Delete(path);
                image.Save(path, ImageFormat.Jpeg);
            }
            catch (Exception)
            { }
        }
    }
}