using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using VideoStreamingService.Data.ViewModels;
using VideoStreamingService.Models;

namespace VideoStreamingService.Data.Services
{
    public class UpdateDataService : IUpdateDataService
    {
        private readonly AppDbContext _context;
        private readonly IUserService _userService;
        private readonly IMemoryCache _cache;
        private readonly IAppConfig _config;

        public UpdateDataService(AppDbContext context, IUserService userService,
            IMemoryCache memoryCache, IAppConfig appConfig)
        {
            _context = context;
            _userService = userService;
            _cache = memoryCache;
            _config = appConfig;
        }

        public async Task<SearchVM> GetSearchResults(int amount, int page, string searchString, string curUserUrl)
        {
            Task<object> task = new Task<object>(() =>
            {
                ListDataCache listData = new ListDataCache()
                    { PagesFrom = page, PagesTo = page + _config.PagesInChunk - 1 };
                List<ISearchElement> searchElements = new List<ISearchElement>();
                searchElements.AddRange(SearchVideosAsync(searchString, curUserUrl).Result);
                searchElements.AddRange(SearchUsersAsync(searchString, curUserUrl).Result);
                searchElements = searchElements.OrderByDescending(se => se.SorensenDiceCoefficient)
                    .ThenByDescending(se => se.MaxResults).ThenByDescending(se => se.Url)
                    .Skip((page - 1) * amount).Take(amount * _config.PagesInChunk).ToList();
                listData.Objects.AddRange(searchElements);
                return listData;
            });
            SearchVM searchVM = new SearchVM()
            {
                SearchString = searchString,
                SearchElements = GetListFromCache(amount, page, nameof(GetSearchResults), task, curUserUrl)
                    .Result.OfType<ISearchElement>().ToList()
            };
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
                    dc2 = Statics.SorensenDiceCoefficient(searchText, video.User.Name) * 0.9f;
                    if (video.Description != null)
                        dc3 = Statics.SorensenDiceCoefficient(searchText, video.Description) * 0.75f;
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

        public async Task<List<FormattedVideo>> GetVideosHistory(int amount, int page, User curUser)
        {
            Task<object> task = new Task<object>(() =>
            {
                ListDataCache fvc = new ListDataCache()
                    { PagesFrom = page, PagesTo = page + _config.PagesInChunk - 1 };

                List<Video> vlist = _context.Videos
                    .Include(u => u.User)
                    .Include(u => u.Views)
                    .Include(u => u.Visibility)
                    .Where(v => v.Views.FirstOrDefault(v => v.UserId == curUser.Id) != null
                                && (v.Visibility.Name != VideoVisibilityEnum.Hidden.ToString() ||
                                    v.UserId == curUser.Id))
                    .OrderByDescending(v => v.Views.FirstOrDefault(v => v.UserId == curUser.Id).Date)
                    .Skip((page - 1) * amount).Take(amount * _config.PagesInChunk) // pagination
                    .ToListAsync().Result;
                fvc.Objects.AddRange(vlist.ToFormattedVideos(curUser));
                return fvc;
            });
            List<FormattedVideo> fv = GetListFromCache(amount, page, nameof(GetVideosHistory), task, curUser.Url)
                .Result.OfType<FormattedVideo>().ToList();
            return fv;
        }

        public async Task<List<FormattedVideo>> GetLastVideos(int daysTake, int daysSkip, int amount, int page,
            User curUser)
        {
            Task<object> task = new Task<object>(() =>
            {
                ListDataCache listData = new ListDataCache()
                    { PagesFrom = page, PagesTo = page + _config.PagesInChunk - 1 };
                DateTime take = DateTime.Now.AddDays(-daysTake);
                DateTime skip = DateTime.Now.AddDays(-daysSkip);
                

                List<Video> videosList = new List<Video>();

                List<User> users = _context.Users
                    .Include(u => u.Subscribers.Where(s => s.Sub_Ignore == true))
                    .Include(u => u.Videos).ThenInclude(v => v.Views)
                    .Include(u => u.Videos).ThenInclude(v => v.Visibility)
                    .Where(u => u.Subscribers.FirstOrDefault(u => u.FromUserId == curUser.Id) != null)
                    .ToList();
                foreach (User user in users)
                {
                    videosList.AddRange(user.Videos.Where(v =>
                        v.Uploaded <= skip && v.Uploaded > take && 
                        v.Visibility.Name == VideoVisibilityEnum.Visible.ToString()));
                }
                videosList = videosList.OrderByDescending(v => v.Uploaded)
                    .Skip((page - 1) * amount * _config.PagesInChunk)
                    .Take(amount * _config.PagesInChunk).ToList();
                listData.Objects.AddRange(videosList.ToFormattedVideos(curUser));
                return listData;
            });
            List<FormattedVideo> fv = GetListFromCache(amount, page, nameof(GetLastVideos), task, curUser.Url)
                .Result.OfType<FormattedVideo>().ToList();
            return fv;
        }

        public async Task<List<FormattedVideo>> GetRandomVideos(
            int amount, int page, User curUser, List<string>? urlsList)
        {
            Task<object> task = new Task<object>(() =>
            {
                ListDataCache listData = new ListDataCache()
                    { PagesFrom = page, PagesTo = page + _config.PagesInChunk - 1 };
                List<Video> videos = GetVideosAsync(amount, page, true, 
                    new[] { VideoVisibilityEnum.Visible }, urlsList: urlsList, pagesInChunk: _config.PagesInChunk)
                    .Result;

                foreach (Video video in videos)
                {
                    if (video.Length > 0 && video.Resolution > 0)
                    {
                        listData.Objects.Add(new FormattedVideo(video, curUser));
                    }
                }

                return listData;
            });
            List<FormattedVideo> fv = GetListFromCache(amount, page, nameof(GetRandomVideos), task, curUser?.Url)
                .Result.OfType<FormattedVideo>().ToList();
            return fv;
        }

        public async Task<List<FormattedVideo>> GetChannelVideos(int amount, int page,
            VideoVisibilityEnum[] visibilitiesArr, User curUser, string channelUrl)
        {
            Task<object> task = new Task<object>(() =>
            {
                ListDataCache listData = new ListDataCache()
                    { PagesFrom = page, PagesTo = page + _config.PagesInChunk - 1 };
                var videos = GetVideosAsync(amount,
                    (page), false,
                    visibilitiesArr, channelUrl, pagesInChunk: _config.PagesInChunk).Result;
                listData.Objects.AddRange(videos.ToFormattedVideos(curUser));
                return listData;
            });
            List<FormattedVideo> formattedVideos = GetListFromCache(
                    amount, page, nameof(GetChannelVideos), task, curUser?.Url)
                .Result.OfType<FormattedVideo>().ToList();
            return formattedVideos;
        }

        private async Task<List<object>> GetListFromCache(int amount, int page, string key,
            Task<object> getVideosTask, string? userUrl = null)
        {
            ListDataCache listData;
            if (!_cache.TryGetValue(key + userUrl, out listData))
            {
                getVideosTask.Start();
                listData = (ListDataCache?)getVideosTask.Result;
                if (userUrl != null)
                    _cache.Set(key + userUrl, listData,
                        new MemoryCacheEntryOptions().SetSlidingExpiration(TimeSpan.FromMinutes(5)));
            }
            else if (listData?.PagesTo < page || listData?.PagesFrom > page || page == 1)
            {
                getVideosTask.Start();
                listData = (ListDataCache?)getVideosTask.Result;
                if (userUrl != null)
                    _cache.Set(key + userUrl, listData,
                        new MemoryCacheEntryOptions().SetSlidingExpiration(TimeSpan.FromMinutes(5)));
            }

            List<object> fv = listData.Objects.Skip(amount * (page - listData.PagesFrom)).Take(amount).ToList();
            return fv;
        }

        public async Task<List<Video>> GetVideosAsync(int? amount = null, int? page = null, bool? shuffle = null,
            VideoVisibilityEnum[]? enums = null, string? userUrl = null, List<string>? urlsList = null, int? pagesInChunk = 1)
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

                        list = list.Take((int)amount * (int)pagesInChunk).ToList();
                    }
                    else
                    {
                        list = list.Skip((int)amount * ((int)page - 1)).Take((int)amount * (int)pagesInChunk).ToList();
                    }
                }
                return list;
            }
            catch (Exception)
            {
                return new List<Video>();
            }
        }
    }
}