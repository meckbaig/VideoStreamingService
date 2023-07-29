using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Newtonsoft.Json.Linq;
using System.Text.Json;
using VideoStreamingService.Data.Services;
using VideoStreamingService.Data.ViewModels;
using VideoStreamingService.Models;

namespace VideoStreamingService.Controllers
{
    public class VideoController : Controller
    {
        private readonly IWebHostEnvironment _appEnvironment;
        private readonly IUserService _userService;
        private readonly IVideoService _videoService;
        private readonly IVideoProcessingService _videoProcessingService;
        //ffmpeg.xabe.net/docs.html

        public VideoController(IWebHostEnvironment appEnvironment, IUserService userService, IVideoService videoService, IVideoProcessingService videoProcessingService)
        {
            _appEnvironment = appEnvironment;
            _userService = userService;
            _videoService = videoService;
            _videoProcessingService = videoProcessingService;
        }

        [RequestFormLimits(MultipartBodyLengthLimit = 2200000000)]
        public async Task<IActionResult> VideoDescriptionParial()
        {
            return PartialView("_VideoDescription");
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = 2200000000)]
        public async Task<IActionResult> VideoDescriptionParial([FromBody] JsonDocument data)
        {
            Video video = data.Deserialize<Video>();
            await _videoService.SaveVideoAsync(video,
                new CancellationTokenSource(TimeSpan.FromSeconds(10)).Token);
            return PartialView("_VideoDescription", video);
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = 2200000000)]
        public IActionResult _VideoDescription(Video video)
        {
            return PartialView(video);
        }

        public async Task<IActionResult> Upload()
        {
            string lp = Request.Headers["Referer"].ToString();
            if (!lp.Contains("/Video/Upload") && !lp.Contains("/Video/SaveVideo"))
                Response.Cookies.Append("LastPage", lp);
            return View(await _videoService.CreateVideo(User));
        }

        public async Task<IActionResult> Edit()
        {
            string lp = Request.Headers["Referer"].ToString();
            if (!lp.Contains("/Video/Upload") && !lp.Contains("/Video/SaveVideo"))
                Response.Cookies.Append("LastPage", lp);
            string url = "";
            if (!String.IsNullOrEmpty(HttpContext.Request.Query[nameof(url)]))
                url = HttpContext.Request.Query[nameof(url)];
            Video video = await _videoService.VideoByUrlMinInfoAsync(url);
            if (video.User.Url == User.Identity.Name || User.IsInRole(RoleEnum.Developer.ToString()))
                return View("Edit", video);
            else
			{
				TempData["Error"] = "Вы не обладаете правами для этого действия!"; 
                if (string.IsNullOrEmpty(Request.Cookies["LastPage"]))
                    return Redirect("/");
                return Redirect(Request.Cookies["LastPage"]);
            }
		}

        public async Task<IActionResult> watch()
        {
            string url = "";
            if (!String.IsNullOrEmpty(HttpContext.Request.Query[nameof(url)]))
                url = HttpContext.Request.Query[nameof(url)];
            Video video = await _videoService.VideoByUrlFullInfoAsync(url);

            List<int> resolutions = new List<int>() { 240 };
            if (video.Resolution >= 480)
                resolutions.Add(480);
            if (video.Resolution >= 720)
                resolutions.Add(720);
            User curUser = await _userService.GetUserByUrlAsync(User.Identity.Name);
            VideoVM videoVM = new VideoVM()
            {
                Video = new FormattedVideo(video, curUser),
                Resolutions = resolutions.OrderByDescending(r => r).ToList(),
            };
            if (videoVM.Video.Visibility != VideoVisibilityEnum.Hidden || videoVM.Video.AllowEdit)
            {
                TempData["WideVideo"] = curUser?.WideVideo;
				return View(videoVM);
            }
            else
            {
                TempData["Error"] = "Доступ к видео ограничен!";
                if (string.IsNullOrEmpty(Request.Cookies["LastPage"]))
                    return Redirect("/");
                return Redirect(Request.Cookies["LastPage"]);

            }
        }

		[HttpPost]
		public async Task<IActionResult> SaveScreenWidth([FromBody] JsonDocument data)
        {
            if (User.Identity.IsAuthenticated)
            {
			    string wideVideo = data.RootElement.GetProperty("wvBool").ToString();
                _userService.SaveScreenWidth(User.Identity.Name, wideVideo == "true");
            }
			return new EmptyResult();
		}

		[HttpPost]
		public async Task<IActionResult> SendComment([FromBody] JsonDocument data)
		{
			string url = data.RootElement.GetProperty("url").ToString();
			string message = data.RootElement.GetProperty("message").ToString();
			Comment comment = await _videoService.AddComment(url, User.Identity.Name, message);
			return PartialView("_Comment", comment);
		}

		[HttpPost]
		public async Task<IActionResult> UpdateComment([FromBody] JsonDocument data)
		{
			long commentId = Convert.ToInt64(data.RootElement.GetProperty(nameof(commentId)).ToString());
			string message = data.RootElement.GetProperty(nameof(message)).ToString();
            await _videoService.UpdateComment(commentId, message);
            return Ok();
		}


		//[HttpPost]
		//public IActionResult SetTempData([FromBody] JsonDocument data)
		//{
		//	string wv = data.RootElement.GetProperty("wideVideo").ToString();
		//	TempData["WideVideo"] = wv == "True" ? "False" : "True";
		//	return new EmptyResult();
		//}

		[HttpPost]
		[RequestFormLimits(MultipartBodyLengthLimit = 2200000000)]
        public async Task<IActionResult> ShowVideoInEditor([FromBody] JsonDocument data)
        {
            string url = data.RootElement.GetProperty("Url").ToString();
            string path = Path.Combine(_appEnvironment.WebRootPath, "Videos", url, "240.mp4");
            string tmpPath = Path.Combine(_appEnvironment.WebRootPath, "Videos", url, "240done");
            while (!System.IO.File.Exists(tmpPath))
            {
                await Task.Delay(1000);
            }
            System.IO.File.Delete(tmpPath);

            return Ok();
        }

        [HttpPost]
        public async Task Reaction([FromBody] JsonDocument data)
        {
            string url = data.RootElement.GetProperty("Url").ToString();
            bool reaction = data.RootElement.GetProperty("Reaction").ToString() == "1" ? true : false;
            bool doneUndone = data.RootElement.GetProperty("DoneUndone").ToString() == "True" ? true : false;
            await _videoService.EditReaction(url, User.Identity.Name, reaction, doneUndone);
        }

        [HttpPost]
        public async Task CountView([FromBody] JsonDocument data)
        {
            if (User.Identity.Name != null)
            {
                string url = data.RootElement.GetProperty("Url").ToString();
                await _videoService.AddViewAsync(url, User);
            }
        }

        [HttpPost]
        public async Task ConvertVideo([FromBody] JsonDocument data)
        {
            string url = data.RootElement.GetProperty("Url").ToString();
            string ex = data.RootElement.GetProperty("Ex").ToString();
            string path = Path.Combine(_appEnvironment.WebRootPath, "Videos", url, $"original{ex}");
            await _videoProcessingService.ConvertVideo(path, Statics.AddToken(url, Statics.TokenType.Upload).Token);
        }

        public async Task<IActionResult> SaveVideo(Video video)
        {
            video.Visibility = (VideoVisibilityEnum)video.VisibilityId;
            var cts = new CancellationTokenSource();
            cts.CancelAfter(TimeSpan.FromSeconds(10));
            video = await _videoProcessingService.AddVideoInfo(video, _appEnvironment.WebRootPath);
            await _videoService.SaveVideoAsync(video, cts.Token);
            if (string.IsNullOrEmpty(Request.Cookies["LastPage"]))
                return Redirect("/");
            return Redirect(Request.Cookies["LastPage"]);
        }

        public async Task<IActionResult> DeleteVideo(Video video)
        {
            if (!await _videoService.DeleteVideo(video))
                return View("Edit");
            _videoService.DeleteDirectory(Path.Combine(_appEnvironment.WebRootPath, "Videos", video.Url));
            if (string.IsNullOrEmpty(Request.Cookies["LastPage"]))
                return Redirect("/");
            return Redirect(Request.Cookies["LastPage"]);
        }
    }
}
