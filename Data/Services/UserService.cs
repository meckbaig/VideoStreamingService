using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.Security.Cryptography;
using System.Text;
using VideoStreamingService.Data.ViewModels;
using VideoStreamingService.Models;

namespace VideoStreamingService.Data.Services
{
	public class UserService : IUserService
	{
		private readonly AppDbContext _context;
		private readonly IAppConfig _config;
		public UserService(AppDbContext context, IAppConfig appConfig)
		{
			_context = context;
			_config = appConfig;
		}

		public User GetUserFromSession(ref ISession session, string userUrl = null)
		{
			User curUser = session.Get<User>("CurUser");
			if (curUser == null & userUrl != null)
			{
				curUser = GetUserByUrlAsync(userUrl).Result;
				foreach (var prop in typeof(User).GetProperties())
				{
					if (prop.PropertyType.ToString().Contains("Generic.List"))
						curUser[prop.Name] = null;
				}
				session.Set("CurUser", curUser);
			}
			return curUser;
		}

		public async Task<User> GetUserByEmailAsync(string email)
		{
			return await _context.Users.Include(u => u.Role)
				.FirstOrDefaultAsync(u => u.Email == email);
		}
		
		public async Task<User> GetUserByUrlAsync(string userUrl)
		{
			return await _context.Users
				.Include(u => u.Subscriptions)
				.Include(u => u.Role)
				.FirstOrDefaultAsync(u => u.Url == userUrl);
		}

		public async Task<User> GetChannelByUrlAsync(string userUrl)
		{
			return await _context.Users
				//.Include(u => u.Videos.OrderByDescending(v => v.Uploaded)).ThenInclude(v => v.Views)
				.Include(u => u.Subscribers.Where(s => s.Sub_Ignore == true))
				.FirstOrDefaultAsync(u => u.Url == userUrl);
		}

		public async Task<List<User>> GetSubscriptions(string userUrl)
		{
			return _context.Users
				.Include(u => u.Subscriptions)
				.ThenInclude(s => s.ToUser)
				.ThenInclude(u => u.Subscribers)
				.FirstOrDefault(u => u.Url == userUrl)
				.Subscriptions.Select(s => s.ToUser)
				.OrderByDescending(u => u.Name).ToList();
		}

		public async Task ChangeSubscription(string channelUrl, string curUserUrl, bool? value = null)
		{
			User channel = await GetChannelByUrlAsync(channelUrl);
			User curUser = await GetUserByUrlAsync(curUserUrl);
			Subscription curSub = curUser.Subscriptions?.FirstOrDefault(s => s.ToUserId == channel.Id);
			if (curSub != null)
			{
				if (value != null)
					curSub.Sub_Ignore = (bool)value;
				else
					_context.Subscriptions.Remove(curSub);
			}
			else
			{
				curSub = new Subscription()
				{
					FromUserId = curUser.Id,
					ToUserId = channel.Id,
					Sub_Ignore = (bool)value
				};
				_context.Subscriptions.Add(curSub);
			}
			_context.SaveChanges();
			StringBuilder debugString = new StringBuilder($"Подписка {curUser.Name} на {channel.Name} изменена ({value})");
			debugString.Replace("()", "(удалена)");
			Debug.WriteLine(debugString.ToString());
		}

		public async Task CreateUserAsync(User user, string password)
		{
			user.Password = Hash(password);
			user.Image = _config.DefaultProfilePicture;
			user.Role = _context.Roles.FirstOrDefault(r => r.Name == ((RoleEnum)user.RoleId).ToString());
			bool unique = false;
			while (!unique)
			{
				for (int i = 0; i < _config.DefaultUrlLength; i++)
				{
					user.Url += _config.UrlChars[new Random().Next(0, _config.UrlChars.Length)];
				}
				if (await GetUserByUrlAsync(user.Url) == null)
					unique = true;
				else
					user.Url = "";
			}
			await _context.AddAsync(user);
			await _context.SaveChangesAsync();
		}

		public async Task<User> SaveUserAsync(EditUserVM user, string[] props)
		{
			try
			{
				User _user = _context.Users.Include(u => u.Role).FirstOrDefault(u => u.Id == user.Id);
				foreach (var prop in props)
				{
					_user[prop] = user[prop];
				}
				_context.SaveChanges();
				Debug.Print($"{user.Name} saved");
				return _user;
			}
			catch (Exception)
			{
				return null;
			}
		}

		public bool PasswordMatches(User user, string password)
		{
			return Hash(password).Equals(user.Password);
		}

		public async Task SaveTheme(string userUrl, string theme)
		{
			_context.Users.FirstOrDefault(u => u.Url == userUrl).Theme = theme;
			_context.SaveChanges();
		}

		public async Task SaveScreenWidth(string userUrl, bool wide)
		{
			_context.Users.FirstOrDefault(u => u.Url == userUrl).WideVideo = wide;
			_context.SaveChanges();
		}

		public async Task<string> ChangeProfilePicture(IFormFile file, string userUrl = null)
		{
			await using var originalStream = new MemoryStream();
			await using var squaredStream = new MemoryStream();
			await file.CopyToAsync(originalStream);
			Bitmap bitmap = new Bitmap(originalStream);
			new Bitmap(bitmap, new Size(128, 128)).Save(squaredStream, ImageFormat.Jpeg);
			byte[] byteImage = squaredStream.ToArray();
			string imgBase64 = Convert.ToBase64String(byteImage);
			if (userUrl != null)
			{
				_context.Users.FirstOrDefault(u => u.Url == userUrl).Image = imgBase64; 
				_context.SaveChanges();
			}
			return imgBase64;
		}

		public async Task<bool> DeleteUser(int id)
		{
			try
			{
				_context.Users.Remove(_context.Users.FirstOrDefault(u => u.Id == id));
				await _context.SaveChangesAsync();
				return true;
			}
			catch (Exception ex)
			{
				Console.WriteLine(ex);
				return false;
			}
		}

		private string Hash(string password)
		{
			using (SHA512 sha512Hash = SHA512.Create())
			{
				byte[] sourceBytes = Encoding.UTF8.GetBytes(password);
				byte[] hashBytes = sha512Hash.ComputeHash(sourceBytes);
				return BitConverter.ToString(hashBytes).Replace("-", String.Empty);
			}
		}
    }
}
