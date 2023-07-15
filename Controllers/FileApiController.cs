using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
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
		private readonly IVideoService _videoService;
		private readonly IVideoProcessingService _videoProcessingService;

		public FileApiController(IWebHostEnvironment _environment, IVideoService videoService, IVideoProcessingService videoProcessingService)
		{
			_webEnvironment = _environment;
			_videoService = videoService;
			_videoProcessingService = videoProcessingService;
		}

		[Route("UploadFiles")]
		[HttpPost]
		[RequestFormLimits(MultipartBodyLengthLimit = 2200000000)]
		public async Task<IActionResult> UploadFiles([FromForm] UploadVideoVM video)
		{
			string path = Path.Combine(_webEnvironment.WebRootPath, "Videos");
			if (!Directory.Exists(path))
				Directory.CreateDirectory(path);
			Directory.CreateDirectory($"{path}\\{video.Id}");

			string ex = Path.GetExtension(video.File.FileName);
			path = Path.Combine(path, video.Id, $"original{ex}");
			using (FileStream stream = new FileStream(path, FileMode.Create))
			{
				video.File.CopyTo(stream);
			}

			IMediaInfo mediaInfo = await FFmpeg.GetMediaInfo(path);
			Statics.TokenType tt = Statics.TokenType.Upload;
			await _videoProcessingService.ExecutePreviews(mediaInfo, path, Statics.AddToken(video.Id, tt).Token);
			Statics.RemoveToken(video.Id, tt);

			return Ok(ex);
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
			cts.Cancel();
		}
	}
}
