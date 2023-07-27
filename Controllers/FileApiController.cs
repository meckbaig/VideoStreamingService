using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.IO;
using System.Text.Json;
using VideoStreamingService.Data.Services;
using VideoStreamingService.Data.ViewModels;
using Xabe.FFmpeg;

namespace VideoStreamingService.Controllers
{
    [Route("api/[controller]")]
	[ApiController]
	public class FileApiController : ControllerBase
	{
		private readonly IWebHostEnvironment _webEnvironment;
        private readonly IUserService _userService;
        private readonly IVideoService _videoService;
        private readonly IVideoProcessingService _videoProcessingService;

		public FileApiController(IWebHostEnvironment _environment, IUserService userService, IVideoService videoService, IVideoProcessingService videoProcessingService)
		{
			_webEnvironment = _environment;
            _userService = userService;
			_videoService = videoService;
			_videoProcessingService = videoProcessingService;
		}

        [Route("UploadVideo")]
        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = 2200000000)]
        public async Task<IActionResult> UploadVideo([FromForm] FileUploadVM video)
        {
            string path = Path.Combine(_webEnvironment.WebRootPath, "Videos");
            if (!Directory.Exists(path))
                Directory.CreateDirectory(path);
            Directory.CreateDirectory($"{path}\\{video.Url}");

            string ext = Path.GetExtension(video.File.FileName);
            path = Path.Combine(path, video.Url, $"original{ext}");
            using (FileStream stream = new FileStream(path, FileMode.Create))
            {
                video.File.CopyTo(stream);
            }

            Statics.TokenType tt = Statics.TokenType.Upload;
            IMediaInfo mediaInfo = await FFmpeg.GetMediaInfo(path);
            await _videoProcessingService.ExecutePreviews(mediaInfo, path, Statics.AddToken(video.Url, tt).Token);
            Statics.RemoveToken(video.Url, tt);

            return Ok(ext);
        }

        [Route("UploadThumbnail")]
        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = 2200000000)]
        public async Task<IActionResult> UploadThumbnail([FromForm] FileUploadVM video)
        {
            string path = Path.Combine(_webEnvironment.WebRootPath, "Videos");
            await _videoProcessingService.CreateThumbnail(path, video);

            return Ok(true);
        }

        [Route("UploadImage")]
        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = 2200000000)]
        public async Task<IActionResult> UploadImage([FromForm] IFormFile file)
        {
            string image = await _userService.ChangeThumbnail(User.Identity.Name, file);
            return Ok(image);
        }

        [Route("GetVideo")]
		public async Task <FileResult> GetVideo()
		{
			string url = "";
			string quality = "";
			if (!String.IsNullOrEmpty(HttpContext.Request.Query[nameof(url)]))
				url = HttpContext.Request.Query[nameof(url)];
			if (!String.IsNullOrEmpty(HttpContext.Request.Query[nameof(quality).ToString()]))
				quality = HttpContext.Request.Query[nameof(quality)];

			string path = Path.Combine(_webEnvironment.WebRootPath, "Videos", url);
			string input = Path.Combine(path, quality + ".mp4");
			if (quality == "")
			{
				short res = await _videoProcessingService.GetMaxResolution(path);
                input = Path.Combine(path, res + ".mp4");
			}

			Debug.WriteLine($"streaming {Path.GetFileNameWithoutExtension(input)}");
			return PhysicalFile(input, "application/octet-stream", enableRangeProcessing: true);
		}

		[Route("ChangeVideo")]
		public async Task ChangeVideo([FromBody] JsonDocument data)
		{
			string url = data.RootElement.GetProperty("Id").ToString();
			CancellationTokenSource cts = Statics.GetToken($"{User.Identity.Name}{url}", Statics.TokenType.Stream);
			if(cts != null)
				cts.Cancel();
		}
	}
}
