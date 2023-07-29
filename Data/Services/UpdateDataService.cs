using Microsoft.EntityFrameworkCore;
using VideoStreamingService.Data.ViewModels;
using VideoStreamingService.Models;

namespace VideoStreamingService.Data.Services
{
    public class UpdateDataService : IUpdateDataService
    {
        private readonly AppDbContext _context;
        private readonly IUserService _userService;
        private readonly IVideoService _videoService;

        public UpdateDataService(AppDbContext context, IUserService userService, IVideoService videoService)
        {
            _context = context;
            _userService = userService;
            _videoService = videoService;
        }


        public async Task<SearchVM> GetSearchResults(int amount, int page, string searchString, string curUserUrl)
        {
            SearchVM searchVM = new SearchVM() { SearchString = searchString };
            searchVM.SearchElements.AddRange(await SearchVideosAsync(searchString, curUserUrl));
            searchVM.SearchElements.AddRange(await SearchUsersAsync(searchString, curUserUrl));
            searchVM.SearchElements = searchVM.SearchElements.OrderByDescending(se => se.SorensenDiceCoefficient)
                .ThenByDescending(se => se.MaxResults).ThenByDescending(se => se.Url)
                .Skip((page - 1) * amount).Take(amount).ToList();
            return searchVM;
        }

        private async Task<List<FormattedVideo>> SearchVideosAsync(string searchText, string curUserUrl)
        {
            User curUser = await _userService.GetUserByUrlAsync(curUserUrl);
            List<Video> videoList = await GetVideosAsync(enums: new[] { VideoVisibilityEnum.Visible });
            List<FormattedVideo> formattedVideos = new List<FormattedVideo>();
            List<Task> tasks = new List<Task>();

            foreach (Video video in videoList)
            {
                var task = new Task(() =>
                {
                    float dc1, dc2, dc3 = 0;
                    FormattedVideo formattedVideo = new FormattedVideo(video, curUser);
                    dc1 = Statics.SorensenDiceCoefficient(searchText, video.Title);
                    dc2 = Statics.SorensenDiceCoefficient(searchText, video.User.Name)*0.9f;
                    if (video.Description != null)
                        dc3 = Statics.SorensenDiceCoefficient(searchText, video.Description)*0.75f;
                    formattedVideo.SorensenDiceCoefficient = Math.Max(dc1, Math.Max(dc2, dc3));
                    if (formattedVideo.SorensenDiceCoefficient > 0)
                        formattedVideos.Add(formattedVideo);
                });
                tasks.Add(task);
                tasks.Last().Start();
            }

            await Task.WhenAll(tasks);
            return formattedVideos;
        }

        private async Task<List<UserChannel>> SearchUsersAsync(string searchText, string curUserUrl)
        {
            User curUser = await _userService.GetUserByUrlAsync(curUserUrl);
            List<User> users = _context.Users.Include(u => u.Subscribers.Where(s => s.Sub_Ignore == true)).ToList();
            List<UserChannel> channels = new List<UserChannel>();
            List<Task> tasks = new List<Task>();

            foreach (User user in users)
            {
                var task = new Task(() =>
                {
                    UserChannel userChannel = new UserChannel(user, curUser);
                    userChannel.SorensenDiceCoefficient =
                        Statics.SorensenDiceCoefficient(searchText, userChannel.Name) * 1.01f;
                    if (userChannel.SorensenDiceCoefficient > 0)
                        channels.Add(userChannel);
                });
                task.Start();
                tasks.Add(task);
            }

            await Task.WhenAll(tasks);
            return channels;
        }

        public async Task<List<FormattedVideo>> GetVideosHistory(int amount, int page, string curUserUrl)
        {
            User curUser = await _userService.GetUserByUrlAsync(curUserUrl);

            List<Video> vlist = await _context.Videos
                .Include(u => u.User)
                .Include(u => u.Views)
                .Include(u => u.Visibility)
                .Where(v => v.Views.FirstOrDefault(v => v.UserId == curUser.Id) != null
                            && (v.Visibility.Name != VideoVisibilityEnum.Hidden.ToString() || v.UserId == curUser.Id))
                .Skip((page - 1) * amount).Take(amount) // pagination
                .OrderByDescending(v => v.Views.FirstOrDefault(v => v.UserId == curUser.Id).Date)
                .ToListAsync();

            List<FormattedVideo> fv = new List<FormattedVideo>();
            foreach (var video in vlist)
            {
                fv.Add(new FormattedVideo(video, curUser));
            }

            return fv;
        }

        public async Task<List<FormattedVideo>> GetLastVideos(int daysTake, int daysSkip, int amount, int page,
            string curUserUrl)
        {
            DateTime take = DateTime.Now.AddDays(-daysTake);
            DateTime skip = DateTime.Now.AddDays(-daysSkip);
            User curUser = _context.Users.Include(u => u.Subscriptions)
                .FirstOrDefault(u => u.Url == curUserUrl);
            List<Subscription> subsList = curUser.Subscriptions.ToList();

            List<Video> videosList = new List<Video>();
            foreach (Subscription sub in subsList)
            {
                User user = _context.Users
                    .Include(u => u.Subscribers.Where(s => s.Sub_Ignore == true))
                    .Include(u => u.Videos).ThenInclude(v => v.Views)
                    .Include(u => u.Videos).ThenInclude(v => v.Visibility)
                    .FirstOrDefault(u => u.Id == sub.ToUserId);

                videosList.AddRange(user.Videos.Where(v =>
                    v.Uploaded <= skip && v.Uploaded > take
                                       && v.Visibility.Name == VideoVisibilityEnum.Visible.ToString()));
            }

            videosList = videosList.OrderByDescending(v => v.Uploaded).Skip((page - 1) * amount).Take(amount).ToList();

            List<FormattedVideo> fv = new List<FormattedVideo>();
            foreach (var video in videosList)
            {
                fv.Add(new FormattedVideo(video, curUser));
            }

            return fv;
        }

        public async Task<List<Video>> GetVideosAsync(int? amount = null, int? page = null, bool? shuffle = null,
            VideoVisibilityEnum[]? enums = null, string? userUrl = null, List<string>? urlsList = null)
        {
            try
            {
                List<Video> list = await _context.Videos
                    .Include(u => u.User)
                    .Include(u => u.Views)
                    .Include(u => u.Visibility)
                    .ToListAsync();

                if (urlsList == null)
                    urlsList = new List<string>();
                if (userUrl != null)
                    list = list.Where(v => v.User.Url == userUrl).ToList();
                if (enums != null)
                {
                    List<Video> newList = new List<Video>();
                    foreach (VideoVisibilityEnum @enum in enums)
                    {
                        newList.AddRange(list.Where(v => v.Visibility == @enum));
                    }
                    list = newList;
                }
                if (shuffle != null)
                {
                    if ((bool)shuffle)
                        list = Statics.Shuffle(list);
                    else
                        list = list.OrderByDescending(v => v.Uploaded).ToList();
                }

                if (amount != null && page != null)
                {
                    if (urlsList.Count > 0)
                    {
                        list = list.Take((int)amount + urlsList.Count).ToList();
                        foreach (string url in urlsList)
                        {
                            list.Remove(list.FirstOrDefault(l => l.Url == url));
                        }
                        list = list.Take((int)amount).ToList();
                    }
                    else
                    {
                        list = list.Skip((int)amount*((int)page-1)).Take((int)amount).ToList();
                    }
                }
                return list;
            }
            catch (Exception)
            {
                return new List<Video>();
            }
        }

        public async Task<List<FormattedVideo>> GetRandomVideos(
            int amount, int page, string curUserUrl, List<string>? urlsList)
        {
            List<Video> videos = await GetVideosAsync(amount, page,
                true, new[] { VideoVisibilityEnum.Visible }, urlsList: urlsList);
            User curUser = await _userService.GetUserByUrlAsync(curUserUrl);

            List<FormattedVideo> fv = new List<FormattedVideo>();
            foreach (Video video in videos)
            {
                if (video.Length > 0 && video.Resolution > 0)
                {
                    fv.Add(new FormattedVideo(video, curUser));
                }
            }
            return fv;
        }
        
    }
}