using Microsoft.EntityFrameworkCore;
using System;
using System.Data;
using System.Diagnostics;
using System.Security.Claims;
using Microsoft.Data.SqlClient;
using VideoStreamingService.Data.Base;
using VideoStreamingService.Data.ViewModels;
using VideoStreamingService.Models;

namespace VideoStreamingService.Data.Services
{
    public class VideoService : EntityBaseRepository<Video>, IVideoService
    {
        private readonly AppDbContext _context;
        private readonly IUserService _userService;
        private readonly IAppConfig _config;

        public VideoService(AppDbContext context, IUserService userService, IAppConfig appConfig) : base(context)
        {
            _context = context;
            _userService = userService;
            _config = appConfig;
        }

        public async Task<Video> CreateVideo(ClaimsPrincipal principal)
        {
            User user = await _userService.GetUserByUrlAsync(principal.Identity.Name);
            Video video = new Video();

            string url = "";
            bool unique = false;
            while (!unique)
            {
                for (int i = 0; i < 10; i++)
                {
                    url += _config.UrlChars[new Random().Next(0, _config.UrlChars.Length)];
                }
                if (await VideoByUrlMinInfoAsync(url) == null)
                    unique = true;
                else
                    url = "";
            }
            video.Url = url;
            video.UserId = user.Id;
            return video;
        }

        public async Task<bool> SaveVideoAsync(Video video, CancellationToken ct)
        {
            try
            {
                if (ct.IsCancellationRequested)
                    return false;
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
                                prop.Name != nameof(Video.UserId) &&
                                prop.Name != nameof(Video.Uploaded) &&
                                prop.Name != nameof(Video.Resolution) &&
                                prop.Name != nameof(Video.Length) && 
                                prop.Name != nameof(Video.Visibility) &&
                                prop.Name != "Item")
                            {
                                _video[prop.Name] = video[prop.Name];
                            }
                        }
                        catch (System.Reflection.TargetParameterCountException)
                        {
                        }
                    }
                    if (video.Visibility != null)
                        _video.Visibility = _context.VideoVisibility.FirstOrDefault(v => v.Name == video.Visibility.Name);
                }
                _context.SaveChanges();
                Debug.Print($"{video.Url} saved");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return false;
            }
        }

        public async Task SaveVideoAsync(Video video, CancellationToken ct, string[] props)
        {
            try
            {
                if (ct.IsCancellationRequested)
                    return;
                Video _video = _context.Videos.FirstOrDefault(v => v.Url == video.Url);
                foreach (var prop in props)
                {
                    _video[prop] = video[prop];
                }
                _context.SaveChanges();
                Debug.Print($"{video.Url} saved");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                throw;
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
            try
            {
                Video video = await _context.Videos
                    .Include(v => v.User)
                    .ThenInclude(u => u.Subscribers)
                    .Include(v => v.Comments
                        .Where(c => c.VideoUrl == url)
                        .OrderByDescending(c => c.Id))
                    .ThenInclude(c => c.User).AsNoTracking()
                    .Include(v => v.Reactions)
                    .Include(v => v.Views)
                    .Include(v => v.Visibility)
                    .AsNoTracking().FirstOrDefaultAsync(v => v.Url == url);
                //var comments = _context.Comments.ToList();
                //List<Comment> comments = _context.Comments.FromSqlRaw($"SELECT * FROM COMMENTS WHERE VideoUrl = '{url}'").ToHashSet().ToList();

                // video.Comments = _context.Comments
                //     .Include(c => c.User).AsNoTracking()
                //     .Where(c => c.VideoUrl == url).OrderByDescending(c => c.Id).ToList();
                return video;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                throw;
            }
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
                string sql =
                    $"UPDATE COMMENTS SET {nameof(Comment.Message)} = @message WHERE {nameof(Comment.Id)} = {commentId}";
                using (SqlConnection connection = new SqlConnection(_context.Database.GetConnectionString()))
                {
                    await connection.OpenAsync();
                    SqlCommand sqlCommand = new SqlCommand(sql, connection);
                    sqlCommand.Parameters.Add("@message", SqlDbType.NVarChar, 500);
                    sqlCommand.Parameters["@message"].Value = message;
                    await sqlCommand.ExecuteNonQueryAsync();
                }
            }
            else
                await _context.Database.ExecuteSqlAsync(
                    $"DELETE FROM COMMENTS WHERE {nameof(Comment.Id)} = {commentId}");
        }
    }
}