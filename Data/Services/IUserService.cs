﻿using System.Security.Claims;
using VideoStreamingService.Data.ViewModels;
using VideoStreamingService.Models;

namespace VideoStreamingService.Data.Services
{
    public interface IUserService
    {
        string NameByUrl(string url);
		Task<User> GetUserByEmailAsync(string email);
        Task<User> GetChannelByUrlAsync(string userUrl);
		Task<List<User>> GetSubscriptions(string userUrl);
		Task<User> GetUserByUrlAsync(string userUrl);
        Task ChangeSubscription(string chUrl, string userUrl, bool? value = null);
        Task CreateUserAsync(User user, string password);
        bool PasswordMatches(User user, string password);
        Task SaveTheme(string userUrl, string theme);
        Task<string> GetTheme(string userUrl);
        Task SaveScreenWidth(string userUrl, bool wide);
        Task<User> SaveUserAsync(EditUserVM user, string[] props);
        Task<string> ChangeThumbnail(string userUrl, IFormFile file);
        Task<List<UserChannel>> SearchUsersAsync(string searchText, string curUserUrl);
    }
}
