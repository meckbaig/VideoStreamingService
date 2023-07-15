using Microsoft.AspNetCore.Mvc;
using VideoStreamingService.Data.ViewModels;
using VideoStreamingService.Data.Services;
using VideoStreamingService.Models;

namespace VideoStreamingService.Controllers
{
	public class ChannelController : Controller
	{
		private readonly IVideoService _videoService;
		private readonly IUserService _userService;

		public ChannelController(IVideoService videoService, IUserService userService)
		{
			_videoService = videoService;
			_userService = userService;
		}

        [Route("{url}")]
        public async Task<IActionResult> Index(string url)
		{

			ChannelVM channelVM = new ChannelVM(
                await _userService.FindByUrlChannelAsync(url), 
				await _userService.FindByUrlUserAsync(User.Identity.Name));

            return View(channelVM);
		}

        [HttpPost]
        [Route("Subscribe/{url}")]
        public async Task<string> Subscribe(string url)
        {
            var url_sub = url.Split('_');
            bool? sub = url_sub[1] == "True" ? null : true;

            await _userService.ChangeSubscription(url_sub[0], User.Identity.Name, sub);

            User channel = await _userService.FindByUrlChannelAsync(url_sub[0]);
            return $"{channel.Subscribers.Where(s => s.Sub_Ignore == true).Count()}";
        }

        //[HttpPost]
        [Route("GetVideos/{roles}")]
        public async Task<IActionResult> GetVideos(string roles)
        {
            List<string> strings = roles.Split('_').ToList();
            string url = strings[0];
            strings.RemoveAt(0);
            VideoVisibilityEnum[]? enums = new VideoVisibilityEnum[strings.Count];
            for (int i = 0; i < strings.Count; i++)
            {
                enums[i] = (VideoVisibilityEnum)Enum.Parse(typeof(VideoVisibilityEnum), strings[i]);
            }

            List<Video> videos = await _videoService.GetVideosAsync(50, 1, false, enums.Length == 0 ? null : enums, url);

			User curUser = await _userService.FindByUrlUserAsync(User.Identity.Name);
			FeedVM feedVM = new FeedVM(){ };

            foreach (var v in videos)
            {
                feedVM.Videos.Add(new FormattedVideo(v, curUser));
            }
            return PartialView("_Videos", feedVM);
        }
    }
}
