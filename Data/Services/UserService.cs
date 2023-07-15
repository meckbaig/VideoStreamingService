using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using VideoStreamingService.Models;
using System.Security.Cryptography;
using System.Text;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using System;
using System.Diagnostics;
using VideoStreamingService.Data.ViewModels;

namespace VideoStreamingService.Data.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;
        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public string NameByPrincipal(ClaimsPrincipal principal)
        {
            try
            {
                User user = _context.Users.FirstOrDefault
                    (u => u.Url == principal.Identity.Name);
                return user?.Name;
            }
            catch (Exception)
            {
                return null;
            }
            
		}
        public async Task<User> FindByEmailAsync(string email)
		{
			return await _context.Users.Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == email);
		}

        public async Task<User> FindByUrlChannelAsync(string url)
        {
            return await _context.Users
                //.Include(u => u.Videos.OrderByDescending(v => v.Uploaded)).ThenInclude(v => v.Views)
                .Include(u => u.Subscribers.Where(s => s.Sub_Ignore == true))
                .FirstOrDefaultAsync(u => u.Url == url);
        }


        public async Task<User> FindByUrlUserAsync(string url)
        {
            return await _context.Users
                .Include(u => u.Subscriptions)
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Url == url);
        }

        //public async Task ChangeSubscription(bool value, int id)
        //{

        //}

        public async Task ChangeSubscription(string chUrl, string userUrl, bool? value = null)
        {
            User channel = await FindByUrlChannelAsync(chUrl);
            User curUser = await FindByUrlUserAsync(userUrl);
            Subscription sub = curUser.Subscriptions?.FirstOrDefault(s => s.ToUserId == channel.Id);
            if (sub != null)
            {
                if (value != null)
                    sub.Sub_Ignore = (bool)value;
                else
                    _context.Subscriptions.Remove(sub);
            }
            else
            {
                sub = new Subscription() 
                { 
                    FromUserId = curUser.Id,
                    ToUserId = channel.Id,
                    Sub_Ignore = (bool)value
                };
                _context.Subscriptions.Add(sub);
            }
            _context.SaveChanges();
            StringBuilder dbgmsg = new StringBuilder($"Подписка {curUser.Name} на {channel.Name} изменена ({value})");
            dbgmsg.Replace("()", "(удалена)");
            Debug.WriteLine(dbgmsg.ToString());
        }

        public async Task CreateUser(User user, string password)
        {
            user.Password = Hash(password);
            user.Role = _context.Roles.FirstOrDefault(r => r == RoleEnum.RegularUser);
			bool unique = false;
            while (!unique)
            {
                for (int i = 0; i < 10; i++)
                {
                    user.Url += Statics.chars[new Random().Next(0, Statics.chars.Length)];
                }
                if (await FindByUrlUserAsync(user.Url) == null)
                    unique = true;
                else
                    user.Url = "";
            }
            await _context.AddAsync(user);
            await _context.SaveChangesAsync();
        }
		public bool PasswordMatches(User user, string password)
		{
            return Hash(password).Equals(user.Password);
		}

        public async Task SaveTheme(string url, string theme)
        {
            _context.Users.FirstOrDefault(u => u.Url == url).Theme = theme;
            _context.SaveChanges();
		}

		public async Task<string> GetTheme(string url)
        {
            return _context.Users.FirstOrDefault(u => u.Url == url)?.Theme;
        }

        public async Task SaveScreenWidth(string url, bool wide)
        {
            _context.Users.FirstOrDefault(u => u.Url == url).WideVideo = wide;
            _context.SaveChanges();
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
