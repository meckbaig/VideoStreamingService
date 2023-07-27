using Microsoft.EntityFrameworkCore;
using System;
using System.Diagnostics;
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
				if (await VideoByUrlMinInfoAsync(url) == null)
					unique = true;
				else
					url = "";
			}

			video.Url = url;
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
					Video _video = _context.Videos.FirstOrDefault(v => v.Url == video.Url);
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
					Debug.Print($"{video.Url} saved");
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
					Video _video = _context.Videos.FirstOrDefault(v => v.Url == video.Url);
					foreach (var prop in props)
					{
						_video[prop] = video[prop];
					}
					_context.SaveChanges();
					Debug.Print($"{video.Url} saved");
					break;
				}

			}
			catch (Exception)
			{
			}
		}

		public async Task<bool> DeleteVideo(Video video)
		{
			var v = _context.Videos.FirstOrDefault(v => v.Url == video.Url);
			try
			{
				Statics.TokenType tt = Statics.TokenType.Upload;
				CancellationTokenSource cts = Statics.GetToken(video.Url, tt);
				if (cts != null)
				{
					cts.Cancel();
					await Task.Delay(1000);
					Statics.RemoveToken(video.Url, tt);
					_context.Videos.Remove(v);

					_context.SaveChanges();
					Debug.Print($"{video.Url} deleted");
					return true;
				}
				else
				{
					_context.Videos.Remove(v);
					_context.SaveChanges();
					Debug.Print($"{video.Url} deleted");
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

		public async Task<Video> VideoByUrlMinInfoAsync(string url)
		{
			Video video = await _context.Videos
				.Include(v => v.User)
				.FirstOrDefaultAsync(v => v.Url == url);
			return video;
		}

		public async Task<Video> VideoByUrlFullInfoAsync(string url)
		{
			Video video = await _context.Videos
				.Include(v => v.User)
				.ThenInclude(u => u.Subscribers)
				.Include(v => v.Reactions)
				.Include(v => v.Views)
				.Include(v => v.Visibility)
				.AsNoTracking().FirstOrDefaultAsync(v => v.Url == url);
			//var comments = _context.Comments.ToList();
			//List<Comment> comments = _context.Comments.FromSqlRaw($"SELECT * FROM COMMENTS WHERE VideoUrl = '{url}'").ToHashSet().ToList();
			video.Comments = _context.Comments
				.Include(c => c.User).AsNoTracking()
				.Where(c => c.VideoUrl == url).OrderByDescending(c => c.Id).ToList();
			return video;
		}

		public async Task AddViewAsync(string url, ClaimsPrincipal principal)
		{
			User user = await _userService.GetUserByUrlAsync(principal.Identity.Name);
			Video video = await VideoByUrlMinInfoAsync(url);
			View view = _context.Views.FirstOrDefault(v => v.UserId == user.Id && v.VideoUrl == video.Url);
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
					VideoUrl = video.Url,
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
				.FirstOrDefault(r => r.VideoUrl == videoId && r.UserId == user.Id);
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
					VideoUrl = videoId,
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

		public async Task<Comment> AddComment(string videoUrl, string userUrl, string message)
		{
			User curUser = await _userService.GetUserByUrlAsync(userUrl);
			Video video = await VideoByUrlMinInfoAsync(videoUrl);
			message = message.Replace("\t", " ");
			while (message.IndexOf("  ") >= 0)
			{
				message = message.Replace("  ", " ");
			}
			Comment comment = new Comment
			{
				Video = video,
				User = curUser,
				Message = message.Trim(),
			};
			await _context.AddAsync(comment);
			await _context.SaveChangesAsync();
			return comment;
		}

		public async Task UpdateComment(long commentId, string message)
		{
			if (!string.IsNullOrEmpty(message))
			{
				message = message.Replace("\t", " ");
				while (message.IndexOf("  ") >= 0)
				{
					message = message.Replace("  ", " ");
				}
				message = message.Trim();
				await _context.Database.ExecuteSqlAsync($"UPDATE COMMENTS SET Message = {message} WHERE Id = {commentId}");
			}
			else
				await _context.Database.ExecuteSqlAsync($"DELETE FROM COMMENTS WHERE Id = {commentId}");
		}
	}
}
