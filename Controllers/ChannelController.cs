using Microsoft.AspNetCore.Mvc;
using VideoStreamingService.Data.ViewModels;
using VideoStreamingService.Data.Services;
using VideoStreamingService.Models;
using System;

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
            if (url.Length < 5) return null;
			ChannelVM channelVM = new ChannelVM(
                await _userService.FindByUrlChannelAsync(url),
                await _userService.GetByUrlUserAsync(User.Identity.Name),
                await _videoService.GetVideosAsync(Statics.VideosOnPage, 1, false, new []{ VideoVisibilityEnum.Visible }, url));
            return View(channelVM);
        }

        [HttpPost]
        [Route("Subscribe/{url_sub}")]
        public async Task<string> Subscribe(string url_sub)
        {
            var url_sub_split = url_sub.Split('_');
            string url = url_sub_split[0];
            bool? sub = url_sub_split[1] == "True" ? null : true;

            await _userService.ChangeSubscription(url, User.Identity.Name, sub);

            User channel = await _userService.FindByUrlChannelAsync(url);
            string subs = channel.Subscribers.Where(s => s.Sub_Ignore == true).Count().ToString();
            return subs;
        }

        //[HttpPost]
        [Route("GetVideos/{url_roles}")]
        public async Task<IActionResult> GetVideos(string url_roles)
        {
            List<string> roles_split = url_roles.Split('_').ToList();
            string url = roles_split[0];
            roles_split.RemoveAt(0);
            VideoVisibilityEnum[]? enums = new VideoVisibilityEnum[roles_split.Count];
            for (int i = 0; i < roles_split.Count; i++)
            {
                enums[i] = (VideoVisibilityEnum)Enum.Parse(typeof(VideoVisibilityEnum), roles_split[i]);
            }

            List<Video> videos = await _videoService.GetVideosAsync(Statics.VideosOnPage, 1, false, enums.Length == 0 ? null : enums, url);

			User curUser = await _userService.GetByUrlUserAsync(User.Identity.Name);

			FeedVM feedVM = new FeedVM(){ };
            foreach (var v in videos)
            {
                feedVM.Videos.Add(new FormattedVideo(v, curUser));
            }

            return PartialView("_Videos", feedVM);
        }
    }
}
