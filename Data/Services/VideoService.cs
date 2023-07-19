using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using System.Globalization;
using System.Security.Claims;
using VideoStreamingService.Data.Base;
using VideoStreamingService.Data.ViewModels;
using VideoStreamingService.Models;

namespace VideoStreamingService.Data.Services
{
	public class VideoService : EntityBaseRepository<Video>, IVideoService
	{
		private readonly AppDbContext _context;
		private readonly IUserService _userService;
		public VideoService(AppDbContext context, IUserService userService) : base(context)
		{
			_context = context;
			_userService = userService;
		}

		public async Task<Video> CreateVideo(ClaimsPrincipal principal)
		{
			Video video = new Video();

			string url = "";
			bool unique = false;
			while (!unique)
			{
				for (int i = 0; i < 10; i++)
				{
					url += Statics.UrlChars[new Random().Next(0, Statics.UrlChars.Length)];
				}
				if (await VideoByIdAsync(url) == null)
					unique = true;
				else
					url = "";
			}

			video.Id = url;
			User user = await _userService.GetUserByUrlAsync(principal.Identity.Name);
			video.UserId = user.Id;
			return video;
		}

		public async Task SaveVideoAsync(Video video, CancellationToken ct)
		{
			try
			{
				while (!ct.IsCancellationRequested)
				{
					Video _video = _context.Videos.FirstOrDefault(v => v.Id == video.Id);
					if (_video == null)
						_context.Videos.Add(video);
					else
					{
						foreach (var prop in video.GetType().GetProperties())
						{
							try
							{
								if (video[prop.Name] != null &&
									prop.Name != "UserId" &&
									prop.Name != "Uploaded" &&
									prop.Name != "Resolution" &&
									prop.Name != "Length" &&
									prop.Name != "Item")
								{
									_video[prop.Name] = video[prop.Name];
								}

							}
							catch (System.Reflection.TargetParameterCountException) { }
						}
					}
					_context.SaveChanges();
					Debug.Print($"{video.Id} saved");
					break;
				}
			}
			catch (Exception)
			{
			}
		}

		public async Task SaveVideoAsync(Video video, CancellationToken ct, string[] props)
		{
			try
			{
				while (!ct.IsCancellationRequested)
				{
					Video _video = _context.Videos.FirstOrDefault(v => v.Id == video.Id);
					foreach (var prop in props)
					{
						_video[prop] = video[prop];
					}
					_context.SaveChanges();
					Debug.Print($"{video.Id} saved");
					break;
				}

			}
			catch (Exception)
			{
			}
		}

		public async Task<bool> DeleteVideo(Video video)
		{
			var v = _context.Videos.FirstOrDefault(v => v.Id == video.Id);
			try
			{
				Statics.TokenType tt = Statics.TokenType.Upload;
				CancellationTokenSource cts = Statics.GetToken(video.Id, tt);
				if (cts != null)
				{
					cts.Cancel();
					await Task.Delay(1000);
					Statics.RemoveToken(video.Id, tt);
					_context.Videos.Remove(v);

					_context.SaveChanges();
					Debug.Print($"{video.Id} deleted");
					return true;
				}
				else
				{
					_context.Videos.Remove(v);
					_context.SaveChanges();
					Debug.Print($"{video.Id} deleted");
					return true;
				}
			}
			catch (Exception)
			{
				return false;
			}

		}

		public async Task DeleteDirectory(string path)
		{
			while (Directory.Exists(path))
			{
				try
				{
					Directory.Delete(path, true);
				}
				catch (IOException)
				{
					Debug.Print("deletion exception catched");
					await Task.Delay(5000);
				}
			}
		}

		public async Task<Video> VideoByIdAsync(string id)
		{
			Video video = await _context.Videos
				.Include(v => v.User)
				.ThenInclude(u => u.Subscribers)
				.Include(v => v.Reactions)
				.Include(v => v.Views)
				.Include(v => v.Visibility)
				.AsNoTracking().FirstOrDefaultAsync(v => v.Id == id);
			return video;
		}

		public async Task<List<Video>> GetVideosAsync(int amount, int page, bool? shuffle = false,
			VideoVisibilityEnum[]? enums = null, string? userUrl = null)
		{
			try
			{
				List<Video> list = await _context.Videos
					.Include(u => u.User)
					.Include(u => u.Views)
					.Include(u => u.Visibility)
					.ToListAsync();

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

				if ((bool)shuffle)
					list = Statics.Shuffle(list);
				else
					list = list.OrderByDescending(v => v.Uploaded).ToList();

				return list;
			}
			catch (Exception)
			{
				return new List<Video>();
			}
		}

		public async Task<List<Video>> GetLastVideos(int daysTake, int daysSkip, string userUrl)
		{
			DateTime take = DateTime.Now.AddDays(-daysTake);
			DateTime skip = DateTime.Now.AddDays(-daysSkip);
			User curUser = _context.Users.Include(u => u.Subscriptions)
				.FirstOrDefault(u => u.Url == userUrl);
			List<Subscription> subsList = curUser.Subscriptions.ToList();

			List<Video> videosList = new List<Video>();
			foreach(Subscription sub in subsList)
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
			videosList = videosList.OrderByDescending(v => v.Uploaded).ToList();

			return videosList;
		}

		public async Task<List<FormattedVideo>> GetViewsHistory(int amount, int page, string curUserUrl)
		{
			User curUser = _context.Users.Include(u => u.Role).FirstOrDefault(u => u.Url == curUserUrl);

			List<Video> vlist = await _context.Videos
				.Include(u => u.User)
				.Include(u => u.Views)
				.Include(u => u.Visibility)
				.Where(v => v.Views.FirstOrDefault(v => v.UserId == curUser.Id) != null 
					&& (v.Visibility.Name != VideoVisibilityEnum.Hidden.ToString() || v.UserId == curUser.Id))
				.Take(amount).Skip((page - 1) * amount)
				.OrderByDescending(v => v.Views.FirstOrDefault(v => v.UserId == curUser.Id).Date)
				.ToListAsync();

			//var list = _context.Users.FirstOrDefault(u => u.Url == curUserUrl).Views
			//	.OrderByDescending(v => v.Date).Select(v => new { v.Video, v.Date })
			//	.Take(amount).Skip((page - 1) * amount).ToList();

			List<FormattedVideo> fv = new List<FormattedVideo>();
			foreach (var video in vlist)
			{
				fv.Add(new FormattedVideo(video, curUser));
			}

			return fv;
		}

		public async Task AddViewAsync(string id, ClaimsPrincipal principal)
		{
			User user = await _userService.GetUserByUrlAsync(principal.Identity.Name);
			Video video = await VideoByIdAsync(id);
			View view = _context.Views.FirstOrDefault(v => v.UserId == user.Id && v.VideoId == video.Id);
			if (view != null)
			{
				view.Watched++;
				view.Date = DateTime.Now;
			}
			else
			{
				view = new View()
				{
					UserId = user.Id,
					VideoId = video.Id,
					Watched = 1
				};
				_context.Views.Add(view);
			}
			_context.SaveChanges();
		}

		public async Task EditReaction(string videoId, string userUrl, bool reaction, bool doneUndone)
		{
			User user = await _userService.GetUserByUrlAsync(userUrl);
			Reaction newReaction = _context.Reactions
				.FirstOrDefault(r => r.VideoId == videoId && r.UserId == user.Id);
			if (newReaction != null)
			{
				if (doneUndone)
				{
					newReaction.Like = reaction;
					newReaction.Date = DateTime.Now;
				}
				else
					_context.Reactions.Remove(newReaction);

			}
			else if (doneUndone)
			{
				newReaction = new Reaction()
				{
					VideoId = videoId,
					UserId = user.Id,
					Like = reaction,
					Date = DateTime.Now
				};
				_context.Reactions.Add(newReaction);
			}
			_context.SaveChanges();
			Debug.WriteLine($"Реакция {reaction} в состоянии {doneUndone}");
		}

		public async Task<bool?> GetReaction(Video video, string userUrl)
		{
			User user = await _userService.GetUserByUrlAsync(userUrl);
			return video.Reactions.FirstOrDefault(r => r.UserId == user.Id)?.Like;
		}
	}
}
